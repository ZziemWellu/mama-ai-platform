from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db

router = APIRouter()

class AccessRiskRequest(BaseModel):
    patient_id: str
    distance_to_facility_km: float
    transport_available: bool
    gestation_weeks: int
    previous_complications: bool

@router.post("/assess")
async def assess_access_risk(request: AccessRiskRequest):
    risk_level = "LOW"
    reason = "Access risk is low."
    
    if request.distance_to_facility_km > 20:
        risk_level = "CRITICAL"
        reason = f"Distance to facility ({request.distance_to_facility_km}km) is critical."
    elif request.distance_to_facility_km > 10:
        risk_level = "HIGH"
        reason = f"Distance to facility ({request.distance_to_facility_km}km) is high."
    elif not request.transport_available:
        risk_level = "HIGH"
        reason = "No transport available for reaching facility."
    
    if request.gestation_weeks >= 37 and request.previous_complications:
        if risk_level == "LOW":
            risk_level = "MODERATE"
            reason = "Previous complications + advanced gestation requires planning."
    
    return {
        "risk_level": risk_level,
        "reason": reason,
        "recommendation": "Consider waiting home admission." if risk_level in ["HIGH", "CRITICAL"] else "Routine monitoring",
        "distance_km": request.distance_to_facility_km,
        "transport_available": request.transport_available
    }
