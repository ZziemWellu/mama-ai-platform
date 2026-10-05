from typing import Optional
"""Real authentication: password hashing + JWT issuance/verification, and the FastAPI dependencies
every route touching patient data is protected by. Replaces the previous login, which only checked
that a phone number existed (no password check at all — User had no password column) and returned a
literal `mock_token_...` string instead of a signed token.
"""
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.enums import Role
from app.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(user: User) -> str:
    if not settings.JWT_SECRET:
        # Fails loudly instead of signing tokens with an empty/predictable key — a missing secret is
        # a deploy-config mistake, not something to silently paper over on a service that holds real
        # patient health data.
        raise RuntimeError("JWT_SECRET is not set")
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {"sub": str(user.id), "role": user.role, "facility_id": str(user.facility_id) if user.facility_id else None, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    try:
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise unauthorized
    except JWTError:
        raise unauthorized

    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if user is None or not user.is_active:
        raise unauthorized
    return user


bearer_optional = HTTPBearer(auto_error=False)


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_optional),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """The logged-in user if a valid token is sent, otherwise None. Never raises."""
    if credentials is None:
        return None
    try:
        return get_current_user(credentials, db)
    except HTTPException:
        return None


def require_role(*allowed_roles: Role):
    """Depends(require_role(Role.ADMIN, Role.DISTRICT_HEALTH_OFFICER)) — 403s any role not listed."""
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in {r.value for r in allowed_roles}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Role '{user.role}' cannot perform this action")
        return user
    return dependency


def require_same_facility_or_admin(user: User, facility_id) -> None:
    """A CHW/midwife may only act on their own facility's data; ADMIN and DISTRICT_HEALTH_OFFICER see
    across facilities (the district officer role exists specifically to look across a district)."""
    if user.role in {Role.ADMIN.value, Role.DISTRICT_HEALTH_OFFICER.value}:
        return
    if user.facility_id is None or str(user.facility_id) != str(facility_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this facility's data")
