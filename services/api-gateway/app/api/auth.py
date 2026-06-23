from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid

from app.core.database import get_db
from app.models import User
from app.schemas import UserCreate, UserOut, LoginRequest, Token

router = APIRouter()

@router.post("/register", response_model=UserOut)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing = db.query(User).filter(User.phone_number == user.phone_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    db_user = User(
        id=uuid.uuid4(),
        phone_number=user.phone_number,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        facility_id=user.facility_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserOut(
        id=str(db_user.id),
        phone_number=db_user.phone_number,
        email=db_user.email,
        full_name=db_user.full_name,
        role=db_user.role,
        is_active=db_user.is_active
    )

@router.post("/login", response_model=Token)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == request.phone_number).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Simple token (for hackathon MVP)
    token = f"mock_token_{user.id}_{datetime.now().timestamp()}"
    
    return Token(access_token=token, token_type="bearer")
