from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.geo import estimate_travel_minutes, haversine_km
from app.models import Facility
from app.schemas import FacilityOut

router = APIRouter()


def _to_facility_out(f: Facility, lat: Optional[float], lng: Optional[float]) -> FacilityOut:
    distance_km = travel_minutes = None
    if lat is not None and lng is not None and f.latitude is not None and f.longitude is not None:
        distance_km = round(haversine_km(lat, lng, f.latitude, f.longitude), 1)
        travel_minutes = estimate_travel_minutes(distance_km)
    return FacilityOut(
        id=str(f.id), name=f.name, type=f.type or "Health Centre",
        distance_km=distance_km, travel_minutes=travel_minutes,
        phone=f.phone, has_csection=f.has_csection or False, has_ambulance=f.has_ambulance or False,
    )


@router.get("/", response_model=List[FacilityOut])
async def get_facilities(
    skip: int = 0,
    limit: int = 100,
    lat: Optional[float] = Query(None, description="Reference latitude — real distance is only computed when given"),
    lng: Optional[float] = Query(None, description="Reference longitude"),
    db: Session = Depends(get_db)
):
    facilities = db.query(Facility).offset(skip).limit(limit).all()
    out = [_to_facility_out(f, lat, lng) for f in facilities]
    if lat is not None and lng is not None:
        out.sort(key=lambda f: f.distance_km if f.distance_km is not None else float("inf"))
    return out


@router.get("/nearby", response_model=List[FacilityOut])
async def get_nearby_facilities(
    lat: float = Query(...),
    lng: float = Query(...),
    radius_km: float = Query(50),
    db: Session = Depends(get_db)
):
    # Real facilities (see seed_facilities.py), real distance, filtered to the requested radius and
    # sorted nearest-first — this used to always return the same two hardcoded facilities regardless
    # of the lat/lng passed in.
    facilities = db.query(Facility).all()
    out = [_to_facility_out(f, lat, lng) for f in facilities]
    out = [f for f in out if f.distance_km is not None and f.distance_km <= radius_km]
    out.sort(key=lambda f: f.distance_km)
    return out
