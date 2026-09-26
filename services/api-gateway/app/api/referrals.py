from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.auth import get_current_user, require_same_facility_or_admin
from app.core.database import get_db
from app.core.geo import estimate_travel_minutes, haversine_km
from app.models import ReferralEvent, Patient, Facility, User
from app.schemas import ReferralRequest, ReferralResponse, FacilityOut

router = APIRouter()

@router.post("/recommend", response_model=ReferralResponse)
async def recommend_referral(request: ReferralRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Recommend nearest referral facility with travel information, by real distance from the
    patient's current location — this used to just take facilities[0] from an unsorted query
    ("Sort by distance (mock for MVP)") and fall back to one hardcoded facility with a placeholder
    phone number if the query came back empty.
    """
    # Get patient
    patient = db.query(Patient).filter(Patient.id == request.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if patient.facility_id:
        require_same_facility_or_admin(current_user, patient.facility_id)

    # has_csection/has_ambulance aren't in the real seeded dataset (see seed_facilities.py) and
    # default to False (unknown), so they can't be used as a hard filter yet without excluding every
    # real facility — only real distance-based ranking is applied here.
    candidates = db.query(Facility).filter(Facility.has_maternity == True).all()
    ranked = sorted(
        (f for f in candidates if f.latitude is not None and f.longitude is not None),
        key=lambda f: haversine_km(request.current_latitude, request.current_longitude, f.latitude, f.longitude),
    )

    best = ranked[0] if ranked else None
    alternatives = ranked[1:4]
    best_distance_km = round(haversine_km(request.current_latitude, request.current_longitude, best.latitude, best.longitude), 1) if best else None
    travel_minutes = estimate_travel_minutes(best_distance_km) if best_distance_km is not None else None

    # Create referral event
    referral = ReferralEvent(
        patient_id=patient.id,
        source_facility_id=patient.facility_id,
        destination_facility_id=best.id if best else None,
        referral_status="PENDING",
        referral_note=generate_referral_note(request, best, best_distance_km)
    )
    db.add(referral)
    db.commit()
    db.refresh(referral)

    return ReferralResponse(
        destination_facility=_to_facility_out(best, request, best_distance_km) if best else None,
        alternatives=[_to_facility_out(f, request) for f in alternatives],
        referral_note=generate_referral_note(request, best, best_distance_km),
        estimated_travel_minutes=travel_minutes or 0,
    )


def _to_facility_out(f: Facility, request: "ReferralRequest", distance_km: Optional[float] = None) -> FacilityOut:
    if distance_km is None:
        distance_km = round(haversine_km(request.current_latitude, request.current_longitude, f.latitude, f.longitude), 1)
    return FacilityOut(
        id=str(f.id), name=f.name, type=f.type or "Health Centre",
        distance_km=distance_km, travel_minutes=estimate_travel_minutes(distance_km),
        phone=f.phone, has_csection=f.has_csection or False, has_ambulance=f.has_ambulance or False,
    )


def generate_referral_note(request: ReferralRequest, facility: Optional[Facility], distance_km: Optional[float]):
    destination = f"{facility.name} ({distance_km} km away)" if facility else "No facility found within range — call the district health office directly"
    return f"""REFERRAL NOTE - MAMA-AI
--------------------------
Patient ID: {request.patient_id}
Gestation: {request.gestation_weeks} weeks
Risk Level: {request.risk_level}
Condition: {request.primary_condition}

Reason: {request.primary_condition} requiring emergency obstetric care

Destination: {destination}
Contact: {facility.phone if facility and facility.phone else 'Phone not on file — call the district health office'}
Time: {datetime.now().strftime('%Y-%m-%d %H:%M')}

MAMA-AI - AI-Powered Referral System
"""

@router.get("/status/{patient_id}")
async def get_referral_status(patient_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if patient and patient.facility_id:
        require_same_facility_or_admin(current_user, patient.facility_id)
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
