from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models import Facility, HealthEconomicsEvent, RiskAssessment
from app.schemas import EconomicsResponse

router = APIRouter()

@router.get("/dashboard", response_model=EconomicsResponse)
async def get_economics_dashboard(
    facility_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Every figure here used to be hardcoded (47200 GHS, 187.3 DALYs, 580 USD/DALY, 24 cases, 18
    # referrals, three fabricated facility rows) via `sum(...) or <fake number>` — which doesn't even
    # do what it looks like it does: a genuine 0 from real data is falsy, so it would silently get
    # replaced by the fake fallback too. Every number below is real, and a genuine zero stays zero.
    events = db.query(HealthEconomicsEvent).all()
    total_savings = sum(e.cost_savings or 0 for e in events)
    total_dalys = sum(float(e.dalys_averted_total or 0) for e in events)
    average_icer = round(total_savings / total_dalys, 2) if total_dalys > 0 else None

    high_risk_cases = db.query(RiskAssessment).filter(RiskAssessment.risk_level.in_(["HIGH", "CRITICAL"])).count()
    successful_referrals = db.query(RiskAssessment).filter(RiskAssessment.referral_initiated == True).count()

    # Attributed via the risk assessment's own referral_facility_id — a HealthEconomicsEvent has no
    # direct facility reference of its own.
    by_facility_map: dict[str, dict] = {}
    for event in events:
        assessment = db.query(RiskAssessment).filter(RiskAssessment.id == event.risk_assessment_id).first()
        if not assessment or not assessment.referral_facility_id:
            continue
        facility = db.query(Facility).filter(Facility.id == assessment.referral_facility_id).first()
        if not facility:
            continue
        entry = by_facility_map.setdefault(facility.name, {"facility_name": facility.name, "cost_savings": 0, "dalys_averted": 0.0})
        entry["cost_savings"] += event.cost_savings or 0
        entry["dalys_averted"] += float(event.dalys_averted_total or 0)
    by_facility = sorted(by_facility_map.values(), key=lambda f: f["cost_savings"], reverse=True)

    return EconomicsResponse(
        total_cost_savings_ghs=total_savings,
        total_dalys_averted=total_dalys,
        average_icer_usd_per_daly=average_icer,
        high_risk_cases=high_risk_cases,
        successful_referrals=successful_referrals,
        by_facility=by_facility,
    )
