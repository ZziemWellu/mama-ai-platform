from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
import logging

from app.core.auth import get_current_user, require_same_facility_or_admin
from app.core.database import get_db
from app.core.geo import estimate_travel_minutes, haversine_km
from app.models import Facility, RiskAssessment, Patient, User
from app.schemas import AssessmentRequest
from app.enums import PrimaryCondition, RiskLevel

router = APIRouter()
logger = logging.getLogger(__name__)

# Clinical rules
#
# PPH and PRE_ECLAMPSIA below are direct, single-measurement rules (a bleeding volume, a BP+headache
# pair) — the same kind of hard threshold a paper-based protocol already uses. OBSTRUCTED_LABOUR and
# SEPSIS are necessarily weaker proxies: this app collects no cervical-dilation/partograph data (so
# "no labour progress" can't be observed directly) and no lab access (so sepsis can't be confirmed by
# blood culture or lactate). Both use WHO-aligned bedside screening signs instead — prolonged active
# labour + severe pain, and fever + foul-smelling discharge — with intentionally lower confidence
# scores than PPH/pre-eclampsia to reflect that they're screening heuristics, not exam-confirmed
# findings. A clinician should review these exact thresholds before this is used on a real patient.
CLINICAL_RULES = {
    "PPH": {
        "condition": PrimaryCondition.PPH,
        "thresholds": {"bleeding_ml": 500},
        "actions": [
            "Uterine massage",
            "Oxytocin 10IU IM",
            "Prepare blood transfusion",
            "Prepare urgent referral"
        ]
    },
    "PRE_ECLAMPSIA": {
        "condition": PrimaryCondition.PRE_ECLAMPSIA,
        "thresholds": {"systolic_bp": 160, "severe_headache": True},
        "actions": [
            "Administer magnesium sulfate",
            "Prepare urgent referral",
            "Monitor BP every 15 minutes"
        ]
    },
    "OBSTRUCTED_LABOUR": {
        "condition": PrimaryCondition.OBSTRUCTED_LABOUR,
        "thresholds": {"labour_hours": 12, "abdominal_pain_severity": 8},
        "actions": [
            "Do NOT augment labour with oxytocin",
            "Keep patient nil by mouth",
            "Position in left lateral position",
            "Monitor fetal heart rate continuously",
            "Prepare urgent referral for possible caesarean section"
        ]
    },
    "SEPSIS": {
        "condition": PrimaryCondition.SEPSIS,
        "thresholds": {"temperature_c": 38.0, "foul_discharge": True},
        "actions": [
            "Start IV fluids",
            "Give broad-spectrum IV antibiotics if available",
            "Reduce fever (tepid sponging / antipyretic)",
            "Monitor temperature and pulse every 30 minutes",
            "Prepare urgent referral"
        ]
    }
}

@router.post("/assess")
async def assess_risk(request: AssessmentRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        logger.info(f"Received assessment request for patient: {request.patient_id}")

        # Get or create patient
        patient = get_or_create_patient(request, db, current_user)
        if patient.facility_id:
            require_same_facility_or_admin(current_user, patient.facility_id)
        logger.info(f"Patient found/created: {patient.id}")

        # Check hard rules
        hard_risk = check_hard_rules(request)

        if hard_risk:
            assessment = RiskAssessment(
                patient_id=patient.id,
                midwife_id=current_user.id,
                risk_level=RiskLevel.CRITICAL.value,
                primary_condition=hard_risk["condition"].value,
                confidence_score=hard_risk["confidence_score"],
                explanation_text=hard_risk["explanation"],
                systolic_bp=request.vitals.systolic_bp,
                diastolic_bp=request.vitals.diastolic_bp,
                temperature=request.vitals.temperature,
                bleeding_estimate_ml=request.symptoms.bleeding_volume,
                headache_severity=request.symptoms.headache_severity,
                visual_changes=request.symptoms.visual_changes,
                abdominal_pain_severity=request.symptoms.abdominal_pain_severity,
                foul_discharge=request.symptoms.foul_discharge,
                labour_hours=request.obstetric_history.labour_hours,
                fever=request.symptoms.fever
            )
            db.add(assessment)
            db.commit()
            db.refresh(assessment)
            
            return {
                "assessment_id": str(assessment.id),
                "risk_level": RiskLevel.CRITICAL.value,
                "primary_condition": hard_risk["condition"].value,
                "confidence_score": hard_risk["confidence_score"],
                "explanation": hard_risk["explanation"],
                "shap_summary": {"bleeding_volume": 0.85},
                "recommended_actions": hard_risk["actions"],
                "referral_options": get_referral_options(db, patient)
            }
        
        # Fallback - Normal
        assessment = RiskAssessment(
            patient_id=patient.id,
            midwife_id=current_user.id,
            risk_level=RiskLevel.LOW.value,
            primary_condition=PrimaryCondition.NORMAL.value,
            confidence_score=0.90,
            explanation_text="No significant danger signs detected",
            systolic_bp=request.vitals.systolic_bp,
            diastolic_bp=request.vitals.diastolic_bp,
            temperature=request.vitals.temperature,
            bleeding_estimate_ml=request.symptoms.bleeding_volume,
            headache_severity=request.symptoms.headache_severity,
            visual_changes=request.symptoms.visual_changes,
            abdominal_pain_severity=request.symptoms.abdominal_pain_severity,
            foul_discharge=request.symptoms.foul_discharge,
            labour_hours=request.obstetric_history.labour_hours,
            fever=request.symptoms.fever
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        
        return {
            "assessment_id": str(assessment.id),
            "risk_level": RiskLevel.LOW.value,
            "primary_condition": PrimaryCondition.NORMAL.value,
            "confidence_score": 0.90,
            "explanation": "No significant danger signs detected",
            "shap_summary": {},
            "recommended_actions": ["Routine monitoring", "Document findings"],
            "referral_options": get_referral_options(db, patient)
        }
    
    except Exception as e:
        logger.error(f"Error in assess_risk: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def get_or_create_patient(request, db, current_user):
    # Try to find by UUID
    try:
        patient_uuid = uuid.UUID(request.patient_id)
        patient = db.query(Patient).filter(Patient.id == patient_uuid).first()
        if patient:
            return patient
    except ValueError:
        pass

    # Try by patient_code
    patient = db.query(Patient).filter(Patient.patient_code == request.patient_id).first()
    if patient:
        return patient

    # Create new — attached to the assessing user's own facility by default, so a CHW/midwife's own
    # patients stay scoped to them (see require_same_facility_or_admin), same as a patient created
    # explicitly through POST /patients.
    new_uuid = uuid.uuid4()
    patient = Patient(
        id=new_uuid,
        facility_id=current_user.facility_id,
        patient_code=request.patient_id if request.patient_id.startswith('P') else f"P{str(new_uuid)[:8]}",
        gestation_weeks=request.obstetric_history.gestation_weeks,
        previous_csection=request.obstetric_history.previous_csection,
        multiple_pregnancy=request.obstetric_history.multiple_pregnancy
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

def check_hard_rules(request):
    if request.symptoms.bleeding_volume and request.symptoms.bleeding_volume > 500:
        return {
            "condition": CLINICAL_RULES["PPH"]["condition"],
            "confidence_score": 0.98,
            "explanation": f"Bleeding >500mL ({request.symptoms.bleeding_volume}mL) requires immediate intervention",
            "actions": CLINICAL_RULES["PPH"]["actions"]
        }
    
    if (request.vitals.systolic_bp and request.vitals.systolic_bp >= 160 and
        request.symptoms.headache_severity and request.symptoms.headache_severity >= 7):
        return {
            "condition": CLINICAL_RULES["PRE_ECLAMPSIA"]["condition"],
            "confidence_score": 0.95,
            "explanation": f"BP {request.vitals.systolic_bp} with severe headache indicates pre-eclampsia",
            "actions": CLINICAL_RULES["PRE_ECLAMPSIA"]["actions"]
        }

    if (request.obstetric_history.labour_hours and request.obstetric_history.labour_hours >= 12 and
        request.symptoms.abdominal_pain_severity and request.symptoms.abdominal_pain_severity >= 8):
        return {
            "condition": CLINICAL_RULES["OBSTRUCTED_LABOUR"]["condition"],
            "confidence_score": 0.85,
            "explanation": (
                f"Labour lasting {request.obstetric_history.labour_hours}h with severe abdominal pain "
                f"(severity {request.symptoms.abdominal_pain_severity}/10) suggests obstructed labour"
            ),
            "actions": CLINICAL_RULES["OBSTRUCTED_LABOUR"]["actions"]
        }

    if (
        (request.symptoms.fever or (request.vitals.temperature and request.vitals.temperature >= 38.0))
        and request.symptoms.foul_discharge
    ):
        return {
            "condition": CLINICAL_RULES["SEPSIS"]["condition"],
            "confidence_score": 0.85,
            "explanation": "Fever with foul-smelling discharge suggests maternal sepsis",
            "actions": CLINICAL_RULES["SEPSIS"]["actions"]
        }

    return None

def get_referral_options(db: Session, patient: Patient):
    # Real facilities (see seed_facilities.py), ranked by real distance from the patient's own
    # facility when that facility has coordinates on file — this used to be two hardcoded entries
    # ("Ejura District Hospital"/"Nkwanta Health Centre") with placeholder phone numbers, returned
    # unconditionally regardless of who or where the patient actually was.
    origin = db.query(Facility).filter(Facility.id == patient.facility_id).first() if patient.facility_id else None
    candidates = db.query(Facility).filter(Facility.has_maternity == True).all()

    if origin and origin.latitude is not None and origin.longitude is not None:
        ranked = sorted(
            (f for f in candidates if f.id != origin.id and f.latitude is not None and f.longitude is not None),
            key=lambda f: haversine_km(origin.latitude, origin.longitude, f.latitude, f.longitude),
        )[:2]
        return [
            {
                "facility_name": f.name,
                "distance_km": round(haversine_km(origin.latitude, origin.longitude, f.latitude, f.longitude), 1),
                "estimated_travel_minutes": estimate_travel_minutes(haversine_km(origin.latitude, origin.longitude, f.latitude, f.longitude)),
                "phone": f.phone,
                "has_csection": f.has_csection or False,
            } for f in ranked
        ]

    # No known origin facility — can't rank by distance, so just surface real facilities without a
    # fabricated distance, same honest-null pattern as facilities.py/referrals.py.
    return [
        {
            "facility_name": f.name,
            "distance_km": None,
            "estimated_travel_minutes": None,
            "phone": f.phone,
            "has_csection": f.has_csection or False,
        } for f in candidates[:2]
    ]
