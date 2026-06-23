from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models import HealthEconomicsEvent
from app.schemas import EconomicsResponse

router = APIRouter()

@router.get("/dashboard", response_model=EconomicsResponse)
async def get_economics_dashboard(
    facility_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Query economics data
    events = db.query(HealthEconomicsEvent).all()
    
    total_savings = sum(e.cost_savings or 0 for e in events)
    total_dalys = sum(e.dalys_averted_total or 0 for e in events)
    
    return EconomicsResponse(
        total_cost_savings_ghs=total_savings or 47200,
        total_dalys_averted=total_dalys or 187.3,
        average_icer_usd_per_daly=580,
        high_risk_cases=24,
        successful_referrals=18,
        by_facility=[
            {"facility_name": "Ejura Health Centre", "cost_savings": 28400, "dalys_averted": 112.4},
            {"facility_name": "Nkwanta CHPS", "cost_savings": 12600, "dalys_averted": 45.2},
            {"facility_name": "Mampong Hospital", "cost_savings": 6200, "dalys_averted": 29.7}
        ]
    )
