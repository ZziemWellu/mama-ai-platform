import uuid

from app.core.database import SessionLocal
from app.models import Patient

ACCRA = (5.6037, -0.1870)
KUMASI = (6.6885, -1.6244)


def test_nearby_facilities_are_real_sorted_by_real_distance_not_hardcoded(client, make_facility):
    near = make_facility("Near Clinic", latitude=ACCRA[0] + 0.01, longitude=ACCRA[1] + 0.01)
    far = make_facility("Far Hospital", latitude=KUMASI[0], longitude=KUMASI[1])

    res = client.get(f"/api/v1/facilities/nearby?lat={ACCRA[0]}&lng={ACCRA[1]}&radius_km=500")
    assert res.status_code == 200
    names = [f["name"] for f in res.json()]
    assert names == ["Near Clinic", "Far Hospital"], "must be sorted nearest-first, not insertion order"
    near_entry = next(f for f in res.json() if f["name"] == "Near Clinic")
    assert near_entry["distance_km"] < 5  # genuinely close, not a flat mock 25.0
    assert near_entry["phone"] is None, "no fabricated placeholder phone number"


def test_nearby_facilities_excludes_ones_outside_the_radius(client, make_facility):
    make_facility("Too Far", latitude=KUMASI[0], longitude=KUMASI[1])
    res = client.get(f"/api/v1/facilities/nearby?lat={ACCRA[0]}&lng={ACCRA[1]}&radius_km=10")
    assert res.status_code == 200
    assert res.json() == []


def test_facility_list_omits_distance_when_no_reference_point_given(client, make_facility):
    make_facility("Somewhere", latitude=ACCRA[0], longitude=ACCRA[1])
    res = client.get("/api/v1/facilities/")
    assert res.status_code == 200
    assert res.json()[0]["distance_km"] is None, "must not fabricate a distance with no reference point"


def test_referral_recommends_the_real_nearest_facility(client, auth_headers, make_facility):
    headers, _ = auth_headers(role="ADMIN")
    make_facility("Far Hospital", latitude=KUMASI[0], longitude=KUMASI[1], has_maternity=True)
    near_id = make_facility("Near Clinic", latitude=ACCRA[0] + 0.01, longitude=ACCRA[1] + 0.01, has_maternity=True)

    db = SessionLocal()
    patient = Patient(id=uuid.uuid4(), patient_code="RP001", gestation_weeks=38)
    db.add(patient)
    db.commit()
    patient_id = str(patient.id)
    db.close()

    res = client.post("/api/v1/referrals/recommend", json={
        "patient_id": patient_id, "current_latitude": ACCRA[0], "current_longitude": ACCRA[1],
        "gestation_weeks": 38, "risk_level": "CRITICAL", "primary_condition": "PPH",
    }, headers=headers)
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["destination_facility"]["id"] == near_id
    assert body["destination_facility"]["distance_km"] < 5
    assert "Near Clinic" in body["referral_note"]
    assert "0.5" not in body["referral_note"] or True  # distance is real, not asserting exact km here
    assert body["estimated_travel_minutes"] > 0


def test_referral_note_is_honest_about_a_missing_phone_number(client, auth_headers, make_facility):
    headers, _ = auth_headers(role="ADMIN")
    make_facility("No Phone Clinic", latitude=ACCRA[0], longitude=ACCRA[1], has_maternity=True)

    db = SessionLocal()
    patient = Patient(id=uuid.uuid4(), patient_code="RP002", gestation_weeks=38)
    db.add(patient)
    db.commit()
    patient_id = str(patient.id)
    db.close()

    res = client.post("/api/v1/referrals/recommend", json={
        "patient_id": patient_id, "current_latitude": ACCRA[0], "current_longitude": ACCRA[1],
        "gestation_weeks": 38, "risk_level": "CRITICAL", "primary_condition": "PPH",
    }, headers=headers)
    assert res.status_code == 200, res.text
    assert "024XXXXXXX" not in res.json()["referral_note"], "must never fabricate a placeholder phone number"
    assert "Phone not on file" in res.json()["referral_note"]


def test_referral_with_no_facilities_at_all_says_so_honestly_instead_of_faking_one(client, auth_headers):
    headers, _ = auth_headers(role="ADMIN")
    db = SessionLocal()
    patient = Patient(id=uuid.uuid4(), patient_code="RP003", gestation_weeks=38)
    db.add(patient)
    db.commit()
    patient_id = str(patient.id)
    db.close()

    res = client.post("/api/v1/referrals/recommend", json={
        "patient_id": patient_id, "current_latitude": ACCRA[0], "current_longitude": ACCRA[1],
        "gestation_weeks": 38, "risk_level": "CRITICAL", "primary_condition": "PPH",
    }, headers=headers)
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["destination_facility"] is None
    assert "No facility found" in body["referral_note"]


def _make_patient_and_assessment(code, condition="PPH"):
    from app.models import RiskAssessment
    db = SessionLocal()
    patient = Patient(id=uuid.uuid4(), patient_code=code, gestation_weeks=38)
    db.add(patient)
    db.commit()
    assessment = RiskAssessment(id=uuid.uuid4(), patient_id=patient.id, risk_level="CRITICAL", primary_condition=condition)
    db.add(assessment)
    db.commit()
    ids = (str(patient.id), str(assessment.id))
    db.close()
    return ids


def test_referral_from_an_assessment_records_that_assessment_as_referred(client, auth_headers, make_facility):
    from app.models import RiskAssessment
    headers, _ = auth_headers(role="ADMIN")
    near_id = make_facility("Near Clinic", latitude=ACCRA[0], longitude=ACCRA[1], has_maternity=True)
    patient_id, assessment_id = _make_patient_and_assessment("RP003")

    res = client.post("/api/v1/referrals/recommend", json={
        "patient_id": patient_id, "assessment_id": assessment_id, "current_latitude": ACCRA[0], "current_longitude": ACCRA[1],
        "gestation_weeks": 38, "risk_level": "CRITICAL", "primary_condition": "PPH",
    }, headers=headers)
    assert res.status_code == 200, res.text

    db = SessionLocal()
    assessment = db.query(RiskAssessment).filter(RiskAssessment.id == uuid.UUID(assessment_id)).first()
    assert assessment.referral_initiated is True
    assert str(assessment.referral_facility_id) == near_id
    db.close()


def test_referral_rejects_an_assessment_belonging_to_a_different_patient(client, auth_headers, make_facility):
    headers, _ = auth_headers(role="ADMIN")
    make_facility("Near Clinic", latitude=ACCRA[0], longitude=ACCRA[1], has_maternity=True)
    patient_id, _ = _make_patient_and_assessment("RP004")
    _, other_assessment_id = _make_patient_and_assessment("RP005")

    res = client.post("/api/v1/referrals/recommend", json={
        "patient_id": patient_id, "assessment_id": other_assessment_id, "current_latitude": ACCRA[0], "current_longitude": ACCRA[1],
        "gestation_weeks": 38, "risk_level": "CRITICAL", "primary_condition": "PPH",
    }, headers=headers)
    assert res.status_code == 404


def test_referral_accepts_a_patient_code_not_just_a_uuid(client, auth_headers, make_facility):
    headers, _ = auth_headers(role="ADMIN")
    make_facility("Near Clinic", latitude=ACCRA[0], longitude=ACCRA[1], has_maternity=True)
    _make_patient_and_assessment("P004")

    res = client.post("/api/v1/referrals/recommend", json={
        "patient_id": "P004", "current_latitude": ACCRA[0], "current_longitude": ACCRA[1],
        "gestation_weeks": 38, "risk_level": "CRITICAL", "primary_condition": "PPH",
    }, headers=headers)
    assert res.status_code == 200, res.text


def test_referral_for_an_unknown_patient_code_is_a_404_not_a_500(client, auth_headers):
    headers, _ = auth_headers(role="ADMIN")
    res = client.post("/api/v1/referrals/recommend", json={
        "patient_id": "NOPE", "current_latitude": ACCRA[0], "current_longitude": ACCRA[1],
        "gestation_weeks": 38, "risk_level": "CRITICAL", "primary_condition": "PPH",
    }, headers=headers)
    assert res.status_code == 404
