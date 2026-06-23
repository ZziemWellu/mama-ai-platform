from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import math

from app.core.database import get_db
from app.models import Facility
from app.schemas import FacilityOut

router = APIRouter()

@router.get("/", response_model=List[FacilityOut])
async def get_facilities(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    facilities = db.query(Facility).offset(skip).limit(limit).all()
    
    return [
        FacilityOut(
            id=str(f.id),
            name=f.name,
            type=f.type or "Health Centre",
            distance_km=25.0,
            travel_minutes=45,
            phone=f.phone or "024XXXXXXX",
            has_csection=f.has_csection or False,
            has_ambulance=f.has_ambulance or False
        ) for f in facilities
    ]

@router.get("/nearby")
async def get_nearby_facilities(
    lat: float = Query(...),
    lng: float = Query(...),
    radius_km: float = Query(50),
    db: Session = Depends(get_db)
):
    # Simplified: return mock facilities
    return [
        {
            "id": "fac1",
            "name": "Ejura District Hospital",
            "type": "District Hospital",
            "distance_km": 25.0,
            "travel_minutes": 45,
            "phone": "024XXXXXXX",
            "has_csection": True,
            "has_ambulance": True
        },
        {
            "id": "fac2",
            "name": "Nkwanta Health Centre",
            "type": "Health Centre",
            "distance_km": 18.0,
            "travel_minutes": 30,
            "phone": "024YYYYYYY",
            "has_csection": False,
            "has_ambulance": False
        }
    ]
