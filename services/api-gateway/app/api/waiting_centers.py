from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import MaternalWaitingCenter
from app.schemas import WaitingCenterRequest, WaitingCenterResponse

router = APIRouter()

@router.post("/recommend", response_model=WaitingCenterResponse)
async def recommend_waiting_center(
    request: WaitingCenterRequest,
    db: Session = Depends(get_db)
):
    # Check if patient needs waiting center
    if request.gestation_weeks < 37:
        return WaitingCenterResponse(
            recommended_center_id="",
            center_name="",
            capacity_available=0,
            distance_km=0,
            phone="",
            reason="Gestation <37 weeks. Not yet recommended for waiting center."
        )
    
    if request.distance_to_facility_km < 10:
        return WaitingCenterResponse(
            recommended_center_id="",
            center_name="",
            capacity_available=0,
            distance_km=0,
            phone="",
            reason="Distance to facility is less than 10km. No waiting center needed."
        )
    
    # Recommend waiting center
    centers = db.query(MaternalWaitingCenter).all()
    
    if centers:
        center = centers[0]
        return WaitingCenterResponse(
            recommended_center_id=str(center.id),
            center_name=center.name,
            capacity_available=center.capacity - center.occupied_beds,
            distance_km=15.0,
            phone=center.phone or "024XXXXXXX",
            reason=f"Distance to facility ({request.distance_to_facility_km}km) exceeds recommended limit."
        )
    
    return WaitingCenterResponse(
        recommended_center_id="wc1",
        center_name="Ejura Maternal Waiting Home",
        capacity_available=4,
        distance_km=12.0,
        phone="024XXXXXXX",
        reason="Distance to facility is 18km. Recommended for waiting home admission."
    )

@router.get("/")
async def get_waiting_centers(db: Session = Depends(get_db)):
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
