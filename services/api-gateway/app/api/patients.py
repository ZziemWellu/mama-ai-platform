from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.auth import get_current_user, require_same_facility_or_admin
from app.core.database import get_db
from app.enums import Role
from app.models import Patient, User
from app.schemas import PatientCreate, PatientOut

router = APIRouter()

# Every route below used to have no auth dependency at all — real patient records (name-adjacent
# fields, obstetric history, village) were readable/writable by anyone who knew the URL. Now every
# route requires a valid session, and a CHW/midwife is scoped to their own facility's patients;
# only ADMIN and DISTRICT_HEALTH_OFFICER can see across facilities (see core/auth.py).

@router.post("/", response_model=PatientOut)
async def create_patient(patient: PatientCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    facility_id = patient.facility_id or (str(current_user.facility_id) if current_user.facility_id else None)
    if facility_id:
        require_same_facility_or_admin(current_user, facility_id)
    elif current_user.role not in {Role.ADMIN.value, Role.DISTRICT_HEALTH_OFFICER.value}:
        raise HTTPException(status_code=400, detail="facility_id is required")

    db_patient = Patient(
        id=uuid.uuid4(),
        facility_id=facility_id,
        patient_code=patient.patient_code,
        age=patient.age,
        gestation_weeks=patient.gestation_weeks,
        gravida=patient.gravida,
        para=patient.para,
        previous_csection=patient.previous_csection,
        multiple_pregnancy=patient.multiple_pregnancy,
        known_conditions=patient.known_conditions,
        village=patient.village,
        distance_to_facility_km=patient.distance_to_facility_km,
        has_transport=patient.has_transport
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)

    return PatientOut(
        id=str(db_patient.id),
        patient_code=db_patient.patient_code,
        age=db_patient.age,
        gestation_weeks=db_patient.gestation_weeks,
        village=db_patient.village,
        created_at=db_patient.created_at
    )

@router.get("/{patient_id}", response_model=PatientOut)
async def get_patient(patient_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if patient.facility_id:
        require_same_facility_or_admin(current_user, patient.facility_id)

    return PatientOut(
        id=str(patient.id),
        patient_code=patient.patient_code,
        age=patient.age,
        gestation_weeks=patient.gestation_weeks,
        village=patient.village,
        created_at=patient.created_at
    )

@router.get("/")
async def list_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Patient)
    if current_user.role not in {Role.ADMIN.value, Role.DISTRICT_HEALTH_OFFICER.value}:
        query = query.filter(Patient.facility_id == current_user.facility_id)
    patients = query.offset(skip).limit(limit).all()
    return [
        {
            "id": str(p.id),
            "patient_code": p.patient_code,
            "age": p.age,
            "gestation_weeks": p.gestation_weeks,
            "village": p.village
        } for p in patients
    ]
