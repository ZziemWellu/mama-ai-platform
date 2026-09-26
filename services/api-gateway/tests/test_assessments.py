ACCRA = (5.6037, -0.1870)
KUMASI = (6.6885, -1.6244)


def _assess(client, headers, **symptom_overrides):
    symptoms = {
        "bleeding_volume": 0, "headache_severity": 0, "visual_changes": False,
        "abdominal_pain_severity": 0, "foul_discharge": False, "fever": False,
    }
    symptoms.update({k: v for k, v in symptom_overrides.items() if k in symptoms})
    obstetric = {"gestation_weeks": 38, "labour_hours": 0, "previous_csection": False, "multiple_pregnancy": False}
    obstetric.update({k: v for k, v in symptom_overrides.items() if k in obstetric})
    vitals = {"systolic_bp": 110, "diastolic_bp": 70, "temperature": 36.8}
    vitals.update({k: v for k, v in symptom_overrides.items() if k in vitals})
    return client.post("/api/v1/assessments/assess", json={
        "patient_id": "P-ASSESS-1", "symptoms": symptoms, "vitals": vitals, "obstetric_history": obstetric,
    }, headers=headers)


def test_normal_vitals_are_low_risk(client, auth_headers):
    headers, _ = auth_headers()
    res = _assess(client, headers)
    assert res.status_code == 200
    assert res.json()["risk_level"] == "LOW"
    assert res.json()["primary_condition"] == "NORMAL"


def test_pph_still_triggers_on_heavy_bleeding(client, auth_headers):
    headers, _ = auth_headers()
    res = _assess(client, headers, bleeding_volume=600)
    assert res.status_code == 200
    assert res.json()["primary_condition"] == "PPH"


def test_obstructed_labour_triggers_on_prolonged_labour_and_severe_pain(client, auth_headers):
    headers, _ = auth_headers()
    res = _assess(client, headers, labour_hours=14, abdominal_pain_severity=9)
    assert res.status_code == 200
    body = res.json()
    assert body["primary_condition"] == "OBSTRUCTED_LABOUR"
    assert body["risk_level"] == "CRITICAL"
    assert "14" in body["explanation"]
    assert body["confidence_score"] < 0.95, "a proxy heuristic must not claim the same confidence as a direct measurement"


def test_obstructed_labour_does_not_trigger_on_prolonged_labour_alone(client, auth_headers):
    headers, _ = auth_headers()
    res = _assess(client, headers, labour_hours=14, abdominal_pain_severity=2)
    assert res.status_code == 200
    assert res.json()["primary_condition"] == "NORMAL", "duration alone, without severe pain, should not fire the hard rule"


def test_sepsis_triggers_on_fever_and_foul_discharge(client, auth_headers):
    headers, _ = auth_headers()
    res = _assess(client, headers, fever=True, foul_discharge=True)
    assert res.status_code == 200
    body = res.json()
    assert body["primary_condition"] == "SEPSIS"
    assert body["risk_level"] == "CRITICAL"


def test_sepsis_triggers_on_measured_temperature_without_the_fever_flag(client, auth_headers):
    headers, _ = auth_headers()
    res = _assess(client, headers, temperature=38.5, foul_discharge=True)
    assert res.status_code == 200
    assert res.json()["primary_condition"] == "SEPSIS"


def test_sepsis_does_not_trigger_on_fever_alone(client, auth_headers):
    headers, _ = auth_headers()
    res = _assess(client, headers, fever=True)
    assert res.status_code == 200
    assert res.json()["primary_condition"] == "NORMAL", "fever without foul discharge should not fire the hard rule"


def test_referral_options_are_real_and_distance_ranked_from_the_patients_own_facility(client, auth_headers, make_facility):
    near_facility = make_facility("Patient's Own Facility", latitude=ACCRA[0], longitude=ACCRA[1])
    make_facility("Nearby Real Hospital", latitude=ACCRA[0] + 0.01, longitude=ACCRA[1] + 0.01, has_maternity=True)
    make_facility("Distant Real Hospital", latitude=KUMASI[0], longitude=KUMASI[1], has_maternity=True)
    headers, _ = auth_headers(facility_id=near_facility)

    res = _assess(client, headers, bleeding_volume=600)
    assert res.status_code == 200
    options = res.json()["referral_options"]
    assert [o["facility_name"] for o in options] == ["Nearby Real Hospital", "Distant Real Hospital"]
    assert options[0]["distance_km"] < 5
    assert options[0]["phone"] is None, "no fabricated placeholder phone number"
    assert "Ejura" not in str(options) and "Nkwanta" not in str(options)
