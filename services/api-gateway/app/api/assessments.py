from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
import logging

from app.core.database import get_db
from app.models import RiskAssessment, Patient
from app.schemas import AssessmentRequest, AssessmentResponse

router = APIRouter()
logger = logging.getLogger(__name__)

# Clinical rules
CLINICAL_RULES = {
    "PPH": {
        "condition": "Postpartum Haemorrhage",
        "thresholds": {"bleeding_ml": 500},
        "actions": [
            "Uterine massage",
            "Oxytocin 10IU IM",
            "Prepare blood transfusion",
            "Prepare urgent referral"
        ]
    },
    "PRE_ECLAMPSIA": {
        "condition": "Severe Pre-eclampsia",
        "thresholds": {"systolic_bp": 160, "severe_headache": True},
        "actions": [
            "Administer magnesium sulfate",
            "Prepare urgent referral",
            "Monitor BP every 15 minutes"
        ]
    }
}

@router.post("/assess")
async def assess_risk(request: AssessmentRequest, db: Session = Depends(get_db)):
    try:
        logger.info(f"Received assessment request for patient: {request.patient_id}")
        
        # Get or create patient
        patient = get_or_create_patient(request, db)
        logger.info(f"Patient found/created: {patient.id}")
        
        # Check hard rules
        hard_risk = check_hard_rules(request)
        
        if hard_risk:
            # Save assessment
            assessment = RiskAssessment(
                patient_id=patient.id,
                risk_level=hard_risk["risk_level"],
                primary_condition=hard_risk["primary_condition"],
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
                "risk_level": hard_risk["risk_level"],
                "primary_condition": hard_risk["primary_condition"],
                "confidence_score": hard_risk["confidence_score"],
                "explanation": hard_risk["explanation"],
                "shap_summary": {"bleeding_volume": 0.85},
                "recommended_actions": hard_risk["actions"],
                "referral_options": get_referral_options()
            }
        
        # Fallback assessment
        fallback = get_fallback_assessment(request)
        
        # Save assessment
        assessment = RiskAssessment(
            patient_id=patient.id,
            risk_level=fallback["risk_level"],
            primary_condition=fallback["primary_condition"],
            confidence_score=fallback["confidence_score"],
            explanation_text=fallback["explanation"],
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
            "risk_level": fallback["risk_level"],
            "primary_condition": fallback["primary_condition"],
            "confidence_score": fallback["confidence_score"],
            "explanation": fallback["explanation"],
            "shap_summary": {},
            "recommended_actions": fallback["actions"],
            "referral_options": get_referral_options()
        }
    
    except Exception as e:
        logger.error(f"Error in assess_risk: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def get_or_create_patient(request, db):
    # Try to find patient by UUID
    try:
        patient_uuid = uuid.UUID(request.patient_id)
        patient = db.query(Patient).filter(Patient.id == patient_uuid).first()
        if patient:
            return patient
    except ValueError:
        pass
    
    # Try to find by patient_code
    patient = db.query(Patient).filter(Patient.patient_code == request.patient_id).first()
    if patient:
        return patient
    
    # Create new patient
    new_uuid = uuid.uuid4()
    patient = Patient(
        id=new_uuid,
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
            "risk_level": "CRITICAL",
            "primary_condition": "PPH",
            "confidence_score": 0.98,
            "explanation": f"Bleeding >500mL ({request.symptoms.bleeding_volume}mL) requires immediate intervention",
            "actions": CLINICAL_RULES["PPH"]["actions"]
        }
    
    if (request.vitals.systolic_bp and request.vitals.systolic_bp >= 160 and 
        request.symptoms.headache_severity and request.symptoms.headache_severity >= 7):
        return {
            "risk_level": "CRITICAL",
            "primary_condition": "PRE_ECLAMPSIA",
            "confidence_score": 0.95,
            "explanation": f"BP {request.vitals.systolic_bp} with severe headache indicates pre-eclampsia",
            "actions": CLINICAL_RULES["PRE_ECLAMPSIA"]["actions"]
        }
    
    return None

def get_fallback_assessment(request):
    risk_factors = []
    
    if request.vitals.systolic_bp and request.vitals.systolic_bp >= 140:
        risk_factors.append("High blood pressure")
    if request.symptoms.bleeding_volume and request.symptoms.bleeding_volume > 200:
        risk_factors.append("Moderate bleeding")
    if request.obstetric_history.labour_hours and request.obstetric_history.labour_hours > 8:
        risk_factors.append("Prolonged labour")
    if request.symptoms.fever:
        risk_factors.append("Fever present")
    
    if risk_factors:
        return {
            "risk_level": "HIGH",
            "primary_condition": "Suspected complication",
            "confidence_score": 0.75,
            "explanation": f"Risk factors detected: {', '.join(risk_factors)}",
            "actions": ["Monitor closely", "Prepare possible referral"]
        }
    
    return {
        "risk_level": "LOW",
        "primary_condition": "Normal",
        "confidence_score": 0.90,
        "explanation": "No significant danger signs detected",
        "actions": ["Routine monitoring", "Document findings"]
    }

def get_referral_options():
    return [
        {
            "facility_name": "Ejura District Hospital",
            "distance_km": 25,
            "estimated_travel_minutes": 45,
            "phone": "024XXXXXXX",
            "has_csection": True
        },
        {
            "facility_name": "Nkwanta Health Centre",
            "distance_km": 18,
            "estimated_travel_minutes": 30,
            "phone": "024YYYYYYY",
            "has_csection": False
        }
    ]
