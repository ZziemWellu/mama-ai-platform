"""Real distance calculation between two lat/lng points. Every referral/facility route used to return
a hardcoded distance_km/travel_minutes regardless of where the patient actually was — this replaces
that with an actual haversine calculation over the real coordinates now seeded on Facility (see
data/ghana_health_facilities.csv and seed_facilities.py).
"""
import math

EARTH_RADIUS_KM = 6371.0

# Straight-line distance, not road distance — real routing (e.g. a roads API) would be more accurate
# but needs a live external service this environment has no credentialed access to. Straight-line
# distance is still a genuine, honest improvement over a flat, unconditional 25.0 km for every row.
def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


# 30 km/h accounts for rural Ghana road conditions (unpaved, seasonal) rather than highway speed —
# still an estimate, not a routed ETA, but a straight-line distance at highway speed would badly
# understate real travel time for exactly the journeys this app exists to plan around.
AVERAGE_RURAL_SPEED_KMH = 30.0


def estimate_travel_minutes(distance_km: float) -> int:
    return round((distance_km / AVERAGE_RURAL_SPEED_KMH) * 60)
