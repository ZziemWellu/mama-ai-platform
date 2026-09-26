from app.core.geo import estimate_travel_minutes, haversine_km


def test_haversine_zero_distance_for_the_same_point():
    assert haversine_km(5.6037, -0.1870, 5.6037, -0.1870) == 0.0


def test_haversine_accra_to_kumasi_is_roughly_correct():
    # Real-world straight-line distance is ~200km; this catches a sign/axis-swap bug, not meant to
    # pin an exact figure.
    accra = (5.6037, -0.1870)
    kumasi = (6.6885, -1.6244)
    distance = haversine_km(*accra, *kumasi)
    assert 180 < distance < 220


def test_travel_minutes_scales_with_distance():
    assert estimate_travel_minutes(30) == 60  # 30km at 30km/h = 1 hour
    assert estimate_travel_minutes(0) == 0
