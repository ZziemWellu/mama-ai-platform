from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from uuid import UUID

# ============ Assessment Schemas ============

class Symptoms(BaseModel):
    bleeding_volume: Optional[int] = Field(None, description="Estimated bleeding in mL")
    headache_severity: Optional[int] = Field(None, ge=0, le=10)
    visual_changes: bool = False
    abdominal_pain_severity: Optional[int] = Field(None, ge=0, le=10)
    foul_discharge: bool = False
    fever: bool = False

class Vitals(BaseModel):
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    temperature: Optional[float] = None

class ObstetricHistory(BaseModel):
    gestation_weeks: int
    labour_hours: Optional[float] = None
    previous_csection: bool = False
    multiple_pregnancy: bool = False

class AssessmentRequest(BaseModel):
    patient_id: str
    symptoms: Symptoms
    vitals: Vitals
    obstetric_history: ObstetricHistory

class AssessmentResponse(BaseModel):
    assessment_id: str
    risk_level: str
    primary_condition: str
    confidence_score: float
    explanation: str
    shap_summary: Dict[str, float] = {}
    recommended_actions: List[str]
    referral_options: List[Dict]

class RiskAssessmentCreate(BaseModel):
    patient_id: str
    midwife_id: Optional[str] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    temperature: Optional[float] = None
    bleeding_estimate_ml: Optional[int] = None
    headache_severity: Optional[int] = None
    visual_changes: bool = False
    abdominal_pain_severity: Optional[int] = None
    foul_discharge: bool = False
    labour_hours: Optional[float] = None
    fever: bool = False
    risk_level: str
    primary_condition: str
    confidence_score: float
    explanation_text: str
    shap_values: Optional[Dict] = None
    actions_taken: Optional[List[str]] = None
    referral_initiated: bool = False
    referral_facility_id: Optional[str] = None
    patient_outcome: Optional[str] = None

class RiskAssessmentOut(BaseModel):
    id: str
    patient_id: str
    risk_level: str
    primary_condition: str
    confidence_score: float
    explanation_text: str
    assessment_time: datetime
    referral_initiated: bool

# ============ Referral Schemas ============

class FacilityOut(BaseModel):
    id: str
    name: str
    type: str
    # None when no reference point (lat/lng) was given to compute a real distance from — never a
    # fabricated placeholder number. Same reasoning for phone: not in the real seeded dataset (see
    # seed_facilities.py), so it's None rather than a fake "024XXXXXXX".
    distance_km: Optional[float] = None
    travel_minutes: Optional[int] = None
    phone: Optional[str] = None
    has_csection: bool
    has_ambulance: bool = False

class ReferralRequest(BaseModel):
    patient_id: str
    current_latitude: float
    current_longitude: float
    gestation_weeks: int
    risk_level: str
    primary_condition: str
    needs_csection: bool = False
    needs_icu: bool = False
    # The assessment this referral acts on. When given, that assessment is recorded as referred, which
    # is what the economics dashboard counts — a referral made without one still works, it just can't
    # be attributed to a specific assessed complication.
    assessment_id: Optional[str] = None

class ReferralResponse(BaseModel):
    destination_facility: Optional[FacilityOut]
    alternatives: List[FacilityOut]
    referral_note: str
    estimated_travel_minutes: int

# ============ Waiting Center Schemas ============

class WaitingCenterRequest(BaseModel):
    patient_id: str
    gestation_weeks: int
    distance_to_facility_km: float
    transport_available: bool
    previous_complications: bool
    # Optional: without a reference point, a recommendation can still be made (by available
    # capacity), just not ranked by real distance.
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None

class WaitingCenterResponse(BaseModel):
    recommended_center_id: Optional[str] = None
    center_name: Optional[str] = None
    capacity_available: Optional[int] = None
    distance_km: Optional[float] = None
    phone: Optional[str] = None
    reason: str

# ============ Economics Schemas ============

class EconomicsResponse(BaseModel):
    total_cost_savings_ghs: int
    total_dalys_averted: float
    # None when there's no real cost/DALY data yet to compute a ratio from — never a fabricated
    # figure standing in for "no data".
    average_icer_usd_per_daly: Optional[float] = None
    high_risk_cases: int
    successful_referrals: int
    by_facility: List[Dict]
    # Real counts of referred assessments per condition, each with its sourced case-fatality rate
    # (None where no honestly matching rate exists — see app/core/health_economics.py).
    referrals_by_condition: List[Dict] = []
    # Sum of case-fatality rates across referred women: the expected maternal deaths those
    # complications carry in West Africa. The risk that was referred on — not deaths averted.
    # None when no referred case has a sourced rate.
    expected_deaths_at_stake: Optional[float] = None
    case_fatality_source: str = ""

# ============ Patient Schemas ============

class PatientCreate(BaseModel):
    facility_id: Optional[str] = None
    patient_code: str
    age: Optional[int] = None
    gestation_weeks: Optional[int] = None
    gravida: Optional[int] = None
    para: Optional[int] = None
    previous_csection: bool = False
    multiple_pregnancy: bool = False
    known_conditions: Optional[List[str]] = None
    village: Optional[str] = None
    distance_to_facility_km: Optional[float] = None
    has_transport: bool = False

class PatientOut(BaseModel):
    id: str
    patient_code: str
    age: Optional[int]
    gestation_weeks: Optional[int]
    village: Optional[str]
    created_at: datetime

# ============ Auth Schemas ============

class UserCreate(BaseModel):
    phone_number: str
    email: Optional[str] = None
    full_name: str
    password: str = Field(..., min_length=8)
    role: str
    facility_id: Optional[str] = None

class UserOut(BaseModel):
    id: str
    phone_number: str
    email: Optional[str]
    full_name: str
    role: str
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    phone_number: str
    password: str
