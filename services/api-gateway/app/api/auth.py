from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from app.core.auth import create_access_token, get_current_user, hash_password, verify_password
from app.core.database import get_db
from app.enums import Role
from app.models import User
from app.schemas import UserCreate, UserOut, LoginRequest, Token

router = APIRouter()

def _user_out(user: User) -> UserOut:
    return UserOut(
        id=str(user.id), phone_number=user.phone_number, email=user.email,
        full_name=user.full_name, role=user.role, is_active=user.is_active,
    )

@router.post("/register", response_model=UserOut)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone_number == user.phone_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    if user.role not in {r.value for r in Role}:
        raise HTTPException(status_code=400, detail=f"role must be one of {[r.value for r in Role]}")

    db_user = User(
        id=uuid.uuid4(),
        phone_number=user.phone_number,
        email=user.email,
        full_name=user.full_name,
        password_hash=hash_password(user.password),
        role=user.role,
        facility_id=user.facility_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return _user_out(db_user)

@router.post("/login", response_model=Token)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone_number == request.phone_number).first()
    # Same "Invalid credentials" message whether the phone number doesn't exist or the password is
    # wrong — a different message for each would let a caller enumerate which phone numbers are
    # registered users of a maternal-health app, which is itself sensitive information.
    if not user or not user.is_active or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user)
    return Token(access_token=token, token_type="bearer")

@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return _user_out(current_user)
