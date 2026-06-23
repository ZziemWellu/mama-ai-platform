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
    distance_km: float
    travel_minutes: int
    phone: str
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

class WaitingCenterResponse(BaseModel):
    recommended_center_id: str
    center_name: str
    capacity_available: int
    distance_km: float
    phone: str
    reason: str

# ============ Economics Schemas ============

class EconomicsResponse(BaseModel):
    total_cost_savings_ghs: int
    total_dalys_averted: float
    average_icer_usd_per_daly: int
    high_risk_cases: int
    successful_referrals: int
    by_facility: List[Dict]

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
    password: Optional[str] = None
