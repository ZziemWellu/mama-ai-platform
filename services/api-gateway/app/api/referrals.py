from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class ReferralRequest(BaseModel):
    patient_id: str
    current_latitude: float
    current_longitude: float
    risk_level: str
    condition: str
    needs_csection: bool = False

class Facility(BaseModel):
    id: str
    name: str
    type: str
    distance_km: float
    travel_minutes: int
    phone: str
    has_csection: bool

@router.post("/recommend")
async def recommend_referral(request: ReferralRequest):
    # Simplified: return mock facilities
    return {
        "destination": {
            "id": "facility_001",
            "name": "Ejura District Hospital",
            "type": "District Hospital",
            "distance_km": 25.0,
            "travel_minutes": 45,
            "phone": "024XXXXXXX",
            "has_csection": True
        },
        "alternatives": [
            {
                "id": "facility_002",
                "name": "Nkwanta Health Centre",
                "type": "Health Centre",
                "distance_km": 18.0,
                "travel_minutes": 30,
                "phone": "024YYYYYYY",
                "has_csection": False
            }
        ],
        "referral_note": f"Patient: {request.patient_id}\n"
                         f"Condition: {request.condition}\n"
                         f"Risk Level: {request.risk_level}\n"
                         f"Urgent referral required for emergency obstetric care."
    }
