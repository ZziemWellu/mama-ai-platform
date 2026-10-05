def _post_register(client, role, headers=None):
    return client.post("/api/v1/auth/register", json={
        "phone_number": f"024{abs(hash((role, str(headers)))) % 10_000_000:07d}", "full_name": "Someone",
        "password": "supersecret1", "role": role,
    }, headers=headers or {})


def test_anyone_can_register_a_community_health_worker(client):
    assert _post_register(client, "COMMUNITY_HEALTH_WORKER").status_code == 200


def test_anyone_can_register_a_midwife(client):
    assert _post_register(client, "MIDWIFE").status_code == 200


def test_anonymous_self_registration_cannot_create_an_admin(client):
    res = _post_register(client, "ADMIN")
    assert res.status_code == 403
    assert "administrator" in res.json()["detail"].lower()


def test_anonymous_self_registration_cannot_create_a_district_officer(client):
    assert _post_register(client, "DISTRICT_HEALTH_OFFICER").status_code == 403


def test_a_community_health_worker_cannot_create_an_admin(client, register_user, login):
    chw = register_user(role="COMMUNITY_HEALTH_WORKER")
    token = login(chw["phone_number"], chw["password"]).json()["access_token"]
    res = _post_register(client, "ADMIN", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403


def test_an_administrator_can_create_a_district_officer(client, register_user, login):
    admin = register_user(role="ADMIN")
    token = login(admin["phone_number"], admin["password"]).json()["access_token"]
    res = _post_register(client, "DISTRICT_HEALTH_OFFICER", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200


def test_a_forged_or_invalid_token_is_treated_as_anonymous(client):
    res = _post_register(client, "ADMIN", headers={"Authorization": "Bearer not-a-real-token"})
    assert res.status_code == 403
