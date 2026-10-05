import os
import uuid

os.environ.setdefault("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/mama_ai_test")
os.environ.setdefault("JWT_SECRET", "test-secret-do-not-use-in-production")
os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:3000")

import pytest
from fastapi.testclient import TestClient

from app.core.database import Base, SessionLocal, engine
from app.main import app
from app.models import Facility


@pytest.fixture(autouse=True)
def clean_schema():
    # Full drop/recreate per test keeps each test isolated without relying on transaction rollback
    # (the app's own get_db() commits mid-request, so a wrapping transaction wouldn't isolate anyway).
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def make_facility():
    def _make_facility(name="Test Facility", latitude=None, longitude=None, **kwargs):
        db = SessionLocal()
        try:
            facility = Facility(id=uuid.uuid4(), name=name, latitude=latitude, longitude=longitude, **kwargs)
            db.add(facility)
            db.commit()
            db.refresh(facility)
            return str(facility.id)
        finally:
            db.close()
    return _make_facility


@pytest.fixture
def register_user(client):
    PRIVILEGED = {"ADMIN", "DISTRICT_HEALTH_OFFICER"}

    def _register(phone_number=None, password="supersecret1", role="MIDWIFE", facility_id=None):
        phone_number = phone_number or f"024{uuid.uuid4().int % 10_000_000:07d}"
        if role in PRIVILEGED:
            # Self-registration can no longer create these roles; tests create them directly, as an admin would.
            from app.core.auth import hash_password
            from app.models import User
            db = SessionLocal()
            try:
                db_user = User(phone_number=phone_number, full_name="Test User", password_hash=hash_password(password),
                               role=role, facility_id=uuid.UUID(facility_id) if facility_id else None)
                db.add(db_user)
                db.commit()
                db.refresh(db_user)
                user_id = str(db_user.id)
            finally:
                db.close()
            return {"phone_number": phone_number, "password": password, "id": user_id, "role": role}
        payload = {"phone_number": phone_number, "full_name": "Test User", "password": password, "role": role}
        if facility_id:
            payload["facility_id"] = facility_id
        res = client.post("/api/v1/auth/register", json=payload)
        assert res.status_code == 200, res.text
        return {"phone_number": phone_number, "password": password, **res.json()}
    return _register


@pytest.fixture
def login(client):
    def _login(phone_number, password):
        res = client.post("/api/v1/auth/login", json={"phone_number": phone_number, "password": password})
        return res
    return _login


@pytest.fixture
def auth_headers(client, register_user, login):
    def _auth_headers(**kwargs):
        user = register_user(**kwargs)
        res = login(user["phone_number"], user["password"])
        assert res.status_code == 200, res.text
        token = res.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}, user
    return _auth_headers
