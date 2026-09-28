import uuid

from app.core.database import SessionLocal
from app.models import Facility, HealthEconomicsEvent, MaternalWaitingCenter, RiskAssessment

ACCRA = (5.6037, -0.1870)
KUMASI = (6.6885, -1.6244)


def _base_request(**overrides):
    body = {
        "patient_id": "P1", "gestation_weeks": 38, "distance_to_facility_km": 20,
        "transport_available": False, "previous_complications": False,
    }
    body.update(overrides)
    return body


def test_waiting_center_says_so_honestly_when_none_are_on_record(client, auth_headers):
    headers, _ = auth_headers()
    res = client.post("/api/v1/waiting-centers/recommend", json=_base_request(), headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["recommended_center_id"] is None
    assert "No maternal waiting home" in body["reason"]
    assert "Ejura" not in body["reason"], "must not fabricate a specific named facility"


def test_waiting_center_ranks_by_real_distance_when_a_reference_point_is_given(client, auth_headers):
    headers, _ = auth_headers()
    db = SessionLocal()
    near = MaternalWaitingCenter(id=uuid.uuid4(), name="Near Home", capacity=10, occupied_beds=2, latitude=ACCRA[0] + 0.01, longitude=ACCRA[1] + 0.01)
    far = MaternalWaitingCenter(id=uuid.uuid4(), name="Far Home", capacity=10, occupied_beds=2, latitude=KUMASI[0], longitude=KUMASI[1])
    db.add_all([near, far])
    db.commit()
    db.close()

    res = client.post("/api/v1/waiting-centers/recommend", json=_base_request(
        current_latitude=ACCRA[0], current_longitude=ACCRA[1],
    ), headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["center_name"] == "Near Home"
    assert body["distance_km"] < 5


def test_waiting_center_excludes_a_fully_occupied_center(client, auth_headers):
    headers, _ = auth_headers()
    db = SessionLocal()
    full = MaternalWaitingCenter(id=uuid.uuid4(), name="Full Home", capacity=5, occupied_beds=5, latitude=ACCRA[0], longitude=ACCRA[1])
    db.add(full)
    db.commit()
    db.close()

    res = client.post("/api/v1/waiting-centers/recommend", json=_base_request(), headers=headers)
    assert res.status_code == 200
    assert res.json()["recommended_center_id"] is None


def test_economics_dashboard_reports_real_zeros_not_fabricated_fallback_numbers(client, auth_headers):
    headers, _ = auth_headers()
    res = client.get("/api/v1/economics/dashboard", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["total_cost_savings_ghs"] == 0, "a genuine zero must stay zero, not become 47200"
    assert body["total_dalys_averted"] == 0
    assert body["average_icer_usd_per_daly"] is None, "can't compute a ratio with no real data"
    assert body["by_facility"] == []


def test_economics_dashboard_computes_real_numbers_from_real_events(client, auth_headers, make_facility):
    headers, _ = auth_headers()
    facility_id = make_facility("Real Facility")
    db = SessionLocal()
    assessment = RiskAssessment(
        id=uuid.uuid4(), risk_level="CRITICAL", primary_condition="PPH",
        referral_initiated=True, referral_facility_id=uuid.UUID(facility_id),
    )
    db.add(assessment)
    db.commit()
    event = HealthEconomicsEvent(risk_assessment_id=assessment.id, cost_savings=1000, dalys_averted_total=5.0)
    db.add(event)
    db.commit()
    db.close()

    res = client.get("/api/v1/economics/dashboard", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["total_cost_savings_ghs"] == 1000
    assert body["total_dalys_averted"] == 5.0
    assert body["average_icer_usd_per_daly"] == 200.0  # 1000 / 5
    assert body["high_risk_cases"] == 1
    assert body["successful_referrals"] == 1
    assert body["by_facility"] == [{"facility_name": "Real Facility", "cost_savings": 1000, "dalys_averted": 5.0}]


def test_economics_reports_referrals_by_condition_with_only_sourced_case_fatality_rates(client, auth_headers):
    headers, _ = auth_headers()
    db = SessionLocal()
    for condition in ["PPH", "PPH", "SEPSIS", "PRE_ECLAMPSIA"]:
        db.add(RiskAssessment(id=uuid.uuid4(), risk_level="CRITICAL", primary_condition=condition, referral_initiated=True))
    db.add(RiskAssessment(id=uuid.uuid4(), risk_level="CRITICAL", primary_condition="SEPSIS", referral_initiated=False))
    db.commit()
    db.close()

    body = client.get("/api/v1/economics/dashboard", headers=headers).json()
    by_condition = {c["condition"]: c for c in body["referrals_by_condition"]}
    assert by_condition["PPH"]["count"] == 2
    assert by_condition["SEPSIS"]["count"] == 1, "an unreferred assessment must not be counted"
    assert by_condition["PRE_ECLAMPSIA"]["case_fatality_rate"] is None, "no honestly matching rate — never approximated"
    assert body["expected_deaths_at_stake"] == round(2 * 0.019 + 0.333, 3)
    assert "MOMA" in body["case_fatality_source"]


def test_economics_expected_deaths_is_null_not_zero_when_nothing_is_estimable(client, auth_headers):
    headers, _ = auth_headers()
    body = client.get("/api/v1/economics/dashboard", headers=headers).json()
    assert body["referrals_by_condition"] == []
    assert body["expected_deaths_at_stake"] is None
