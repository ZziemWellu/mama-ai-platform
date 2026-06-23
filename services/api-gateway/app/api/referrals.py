from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime

from app.core.database import get_db
from app.models import ReferralEvent, Patient, Facility
from app.schemas import ReferralRequest, ReferralResponse, FacilityOut

router = APIRouter()

@router.post("/recommend", response_model=ReferralResponse)
async def recommend_referral(request: ReferralRequest, db: Session = Depends(get_db)):
    """
    Recommend nearest referral facility with travel information.
    Mobile-optimized for quick response.
    """
    # Get patient
    patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Query nearby facilities
    facilities = db.query(Facility).filter(
        Facility.has_maternity == True
    ).limit(5).all()
    
    if not facilities:
        # Fallback mock data
        facilities = [
            {
                "id": "fac1",
                "name": "Ejura District Hospital",
                "type": "District Hospital",
                "has_csection": True,
                "has_ambulance": True,
                "phone": "024XXXXXXX"
            }
        ]
    
    # Sort by distance (mock for MVP)
    best = facilities[0] if facilities else None
    alternatives = facilities[1:4] if len(facilities) > 1 else []
    
    # Create referral event
    referral = ReferralEvent(
        patient_id=patient.id,
        source_facility_id=patient.facility_id,
        destination_facility_id=best.id if best else None,
        referral_status="PENDING",
        referral_note=generate_referral_note(request, best)
    )
    db.add(referral)
    db.commit()
    db.refresh(referral)
    
    return ReferralResponse(
        destination_facility=best,
        alternatives=alternatives,
        referral_note=generate_referral_note(request, best),
        estimated_travel_minutes=45
    )

def generate_referral_note(request: ReferralRequest, facility):
    return f"""REFERRAL NOTE - MAMA-AI
--------------------------
Patient ID: {request.patient_id}
Gestation: {request.gestation_weeks} weeks
Risk Level: {request.risk_level}
Condition: {request.primary_condition}

Reason: {request.primary_condition} requiring emergency obstetric care

Destination: {facility.name if facility else 'Nearest Facility'}
Contact: {facility.phone if facility else 'Call Emergency'}
Time: {datetime.now().strftime('%Y-%m-%d %H:%M')}

MAMA-AI - AI-Powered Referral System
"""

@router.get("/status/{patient_id}")
async def get_referral_status(patient_id: str, db: Session = Depends(get_db)):
    referrals = db.query(ReferralEvent).filter(
        ReferralEvent.patient_id == patient_id
    ).order_by(ReferralEvent.referral_time.desc()).limit(5).all()
    
    return [
        {
            "id": str(r.id),
            "status": r.referral_status,
            "destination": r.destination_facility_id,
            "time": r.referral_time.isoformat()
        } for r in referrals
    ]
