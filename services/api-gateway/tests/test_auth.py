def test_register_then_login_succeeds(client, register_user, login):
    user = register_user(password="supersecret1")
    res = login(user["phone_number"], "supersecret1")
    assert res.status_code == 200
    body = res.json()
    assert body["token_type"] == "bearer"
    assert len(body["access_token"].split(".")) == 3  # a real JWT has three dot-separated parts


def test_login_rejects_wrong_password(client, register_user, login):
    user = register_user(password="supersecret1")
    res = login(user["phone_number"], "wrong-password")
    assert res.status_code == 401


def test_login_rejects_unknown_phone_number(client, login):
    res = login("0240000099", "whatever")
    assert res.status_code == 401


def test_registering_the_same_phone_number_twice_is_rejected(client, register_user):
    user = register_user(phone_number="0241111111")
    res = client.post("/api/v1/auth/register", json={
        "phone_number": "0241111111", "full_name": "Someone Else", "password": "anotherpass1", "role": "MIDWIFE",
    })
    assert res.status_code == 400


def test_registering_with_an_invalid_role_is_rejected(client):
    res = client.post("/api/v1/auth/register", json={
        "phone_number": "0242222222", "full_name": "Someone", "password": "supersecret1", "role": "SUPERUSER",
    })
    assert res.status_code == 400


def test_password_is_never_returned_in_plaintext(client):
    res = client.post("/api/v1/auth/register", json={
        "phone_number": "0244444444", "full_name": "Someone", "password": "supersecret1", "role": "MIDWIFE",
    })
    assert res.status_code == 200
    body = res.json()
    assert "password" not in body
    assert "password_hash" not in body


def test_protected_route_rejects_missing_token(client):
    res = client.get("/api/v1/patients/")
    assert res.status_code == 403


def test_protected_route_rejects_garbage_token(client):
    res = client.get("/api/v1/patients/", headers={"Authorization": "Bearer not-a-real-token"})
    assert res.status_code == 401


def test_protected_route_accepts_a_real_token(client, auth_headers):
    headers, _ = auth_headers()
    res = client.get("/api/v1/patients/", headers=headers)
    assert res.status_code == 200


def test_me_returns_the_authenticated_users_own_profile(client, auth_headers):
    headers, user = auth_headers(phone_number="0243333333")
    res = client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 200
    assert res.json()["phone_number"] == "0243333333"


def test_a_midwife_cannot_read_a_patient_from_another_facility(client, auth_headers, make_facility):
    facility_a = make_facility("Facility A")
    facility_b = make_facility("Facility B")
    headers_a, _ = auth_headers(facility_id=facility_a)
    headers_b, _ = auth_headers(facility_id=facility_b)

    created = client.post("/api/v1/patients/", json={"patient_code": "P001", "facility_id": facility_a}, headers=headers_a)
    assert created.status_code == 200, created.text
    patient_id = created.json()["id"]

    same_facility = client.get(f"/api/v1/patients/{patient_id}", headers=headers_a)
    assert same_facility.status_code == 200

    other_facility = client.get(f"/api/v1/patients/{patient_id}", headers=headers_b)
    assert other_facility.status_code == 403


def test_listing_patients_only_shows_the_callers_own_facility(client, auth_headers, make_facility):
    facility_a = make_facility("Facility A")
    facility_b = make_facility("Facility B")
    headers_a, _ = auth_headers(facility_id=facility_a)
    headers_b, _ = auth_headers(facility_id=facility_b)

    client.post("/api/v1/patients/", json={"patient_code": "PA1", "facility_id": facility_a}, headers=headers_a)
    client.post("/api/v1/patients/", json={"patient_code": "PB1", "facility_id": facility_b}, headers=headers_b)

    list_a = client.get("/api/v1/patients/", headers=headers_a).json()
    assert [p["patient_code"] for p in list_a] == ["PA1"]


def test_an_admin_can_see_patients_across_facilities(client, auth_headers, make_facility):
    facility_a = make_facility("Facility A")
    headers_a, _ = auth_headers(facility_id=facility_a)
    admin_headers, _ = auth_headers(role="ADMIN")

    client.post("/api/v1/patients/", json={"patient_code": "PA2", "facility_id": facility_a}, headers=headers_a)

    admin_list = client.get("/api/v1/patients/", headers=admin_headers).json()
    assert any(p["patient_code"] == "PA2" for p in admin_list)
