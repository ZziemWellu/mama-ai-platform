"""Drift safeguard: the client-side clinical rules (apps/mobile-pwa/app/lib/offlineRiskRules.ts) are
a JS port of check_hard_rules() below, used to give a CHW an instant risk read with no signal. This
runs the same fixture file (../../../shared/clinical-rules-fixtures.json) against the real Python
implementation; apps/mobile-pwa/scripts/verify-offline-rules.mjs runs it against the JS port. If you
change check_hard_rules(), update the fixture and the JS port to match, then re-run both.
"""
import json
import os

import pytest

from app.api.assessments import check_hard_rules
from app.enums import RiskLevel

FIXTURES_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "shared", "clinical-rules-fixtures.json")

with open(FIXTURES_PATH, encoding="utf-8") as f:
    FIXTURES = json.load(f)


class _Obj:
    """A tiny attribute-access wrapper so fixture dicts can be passed to check_hard_rules() the same
    way Pydantic request objects are (request.symptoms.bleeding_volume, not request["symptoms"][...])."""
    def __init__(self, data):
        for key, value in data.items():
            setattr(self, key, _Obj(value) if isinstance(value, dict) else value)


@pytest.mark.parametrize("fixture", FIXTURES, ids=[f["name"] for f in FIXTURES])
def test_fixture_matches_real_backend_rules(fixture):
    request = _Obj(fixture["input"])
    hard_risk = check_hard_rules(request)

    if fixture["expected"]["condition"] == "NORMAL":
        assert hard_risk is None, f"expected no hard rule to fire for '{fixture['name']}'"
        assert fixture["expected"]["risk_level"] == RiskLevel.LOW.value
    else:
        assert hard_risk is not None, f"expected a hard rule to fire for '{fixture['name']}'"
        assert hard_risk["condition"].value == fixture["expected"]["condition"]
        assert fixture["expected"]["risk_level"] == "CRITICAL"
