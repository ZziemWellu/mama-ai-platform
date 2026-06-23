from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict

router = APIRouter()

class Symptoms(BaseModel):
    bleeding_volume: Optional[int] = None
    headache_severity: Optional[int] = None
    visual_changes: bool = False
    abdominal_pain_severity: Optional[int] = None
    fever: bool = False

class Vitals(BaseModel):
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    temperature: Optional[float] = None

class ObstetricHistory(BaseModel):
    gestation_weeks: int
    labour_hours: Optional[float] = None
    previous_csection: bool = False
    multiple_pregnancy: bool = False

class AssessmentRequest(BaseModel):
    patient_id: str
    symptoms: Symptoms
    vitals: Vitals
    obstetric_history: ObstetricHistory

class AssessmentResponse(BaseModel):
    risk_level: str  # LOW, MODERATE, HIGH, CRITICAL
    primary_condition: str
    confidence_score: float
    explanation: str
    recommended_actions: List[str]

@router.post("/assess", response_model=AssessmentResponse)
async def assess_risk(request: AssessmentRequest):
    """
    Assess maternal risk based on symptoms, vitals, and obstetric history.
    """
    # Simple rule-based logic for MVP
    risk_level = "LOW"
    condition = "No immediate danger"
    explanation = "All vitals and symptoms appear normal."
    actions = ["Continue routine monitoring", "Document findings"]
    
    # Check for PPH
    if request.symptoms.bleeding_volume and request.symptoms.bleeding_volume > 500:
        risk_level = "CRITICAL"
        condition = "Postpartum Haemorrhage"
        explanation = f"Bleeding >500mL ({request.symptoms.bleeding_volume}mL) indicates PPH."
        actions = ["Uterine massage", "Oxytocin 10IU IM", "Prepare for referral"]
    
    # Check for Pre-eclampsia
    elif request.vitals.systolic_bp and request.vitals.systolic_bp >= 160:
        if request.symptoms.headache_severity and request.symptoms.headache_severity >= 7:
            risk_level = "CRITICAL"
            condition = "Severe Pre-eclampsia"
            explanation = f"BP {request.vitals.systolic_bp}/{request.vitals.diastolic_bp} with severe headache."
            actions = ["Administer magnesium sulfate", "Prepare for referral", "Monitor BP q15min"]
        else:
            risk_level = "HIGH"
            condition = "Pre-eclampsia"
            explanation = f"BP {request.vitals.systolic_bp}/{request.vitals.diastolic_bp} requires monitoring."
            actions = ["Monitor BP", "Check urine protein", "Schedule follow-up"]
    
    # Check for fever/sepsis
    elif request.symptoms.fever or (request.vitals.temperature and request.vitals.temperature >= 38.0):
        risk_level = "HIGH"
        condition = "Possible Sepsis"
        explanation = f"Fever detected ({request.vitals.temperature}°C). Watch for infection."
        actions = ["Administer antibiotics", "Monitor vitals", "Prepare for referral if worsens"]
    
    return AssessmentResponse(
        risk_level=risk_level,
        primary_condition=condition,
        confidence_score=0.85,
        explanation=explanation,
        recommended_actions=actions
    )

@router.get("/conditions")
async def get_conditions():
    """Get list of conditions the system can assess."""
    return {
        "conditions": [
            {"id": "pph", "name": "Postpartum Haemorrhage", "risk": "CRITICAL"},
            {"id": "pre_eclampsia", "name": "Pre-eclampsia/Eclampsia", "risk": "CRITICAL"},
            {"id": "obstructed_labour", "name": "Obstructed Labour", "risk": "HIGH"},
            {"id": "sepsis", "name": "Sepsis", "risk": "HIGH"},
            {"id": "normal", "name": "Normal Delivery", "risk": "LOW"}
        ]
    }
