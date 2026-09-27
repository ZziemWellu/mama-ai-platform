from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.auth import get_current_user
from app.core.database import get_db
from app.core.geo import haversine_km
from app.models import MaternalWaitingCenter, User
from app.schemas import WaitingCenterRequest, WaitingCenterResponse

router = APIRouter()

def _no_recommendation(reason: str) -> WaitingCenterResponse:
    return WaitingCenterResponse(reason=reason)

@router.post("/recommend", response_model=WaitingCenterResponse)
async def recommend_waiting_center(
    request: WaitingCenterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if request.gestation_weeks < 37:
        return _no_recommendation("Gestation <37 weeks. Not yet recommended for waiting center.")
    if request.distance_to_facility_km < 10:
        return _no_recommendation("Distance to facility is less than 10km. No waiting center needed.")

    centers = [c for c in db.query(MaternalWaitingCenter).all() if (c.capacity - c.occupied_beds) > 0]
    if not centers:
        # No fabricated fallback: this used to invent "Ejura Maternal Waiting Home" out of thin air
        # (complete with a placeholder phone number) whenever the table was empty or full.
        return _no_recommendation(
            "No maternal waiting home is currently on record with an available bed. "
            "Contact the district health office directly."
        )

    has_reference_point = request.current_latitude is not None and request.current_longitude is not None
    if has_reference_point:
        ranked = sorted(
            (c for c in centers if c.latitude is not None and c.longitude is not None),
            key=lambda c: haversine_km(request.current_latitude, request.current_longitude, c.latitude, c.longitude),
        )
        center = ranked[0] if ranked else centers[0]
        distance_km = (
            round(haversine_km(request.current_latitude, request.current_longitude, center.latitude, center.longitude), 1)
            if center.latitude is not None and center.longitude is not None else None
        )
    else:
        # No location to rank by distance — pick the center with the most available capacity instead
        # of an arbitrary first-in-list pick.
        center = max(centers, key=lambda c: c.capacity - c.occupied_beds)
        distance_km = None

    return WaitingCenterResponse(
        recommended_center_id=str(center.id),
        center_name=center.name,
        capacity_available=center.capacity - center.occupied_beds,
        distance_km=distance_km,
        phone=center.phone,
        reason=f"Distance to facility ({request.distance_to_facility_km}km) exceeds recommended limit.",
    )

@router.get("/")
async def get_waiting_centers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    centers = db.query(MaternalWaitingCenter).all()
    return [
        {
            "id": str(c.id),
            "name": c.name,
            "capacity": c.capacity,
            "occupied": c.occupied_beds,
            "phone": c.phone
        } for c in centers
    ]
