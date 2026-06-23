from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = Column(String(20), unique=True)
    email = Column(String(255), unique=True)
    full_name = Column(String(100))
    role = Column(String(50))
    facility_id = Column(UUID(as_uuid=True))
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Facility(Base):
    __tablename__ = "facilities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    type = Column(String(50))
    region = Column(String(50))
    district = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    phone = Column(String(20))
    has_ambulance = Column(Boolean, default=False)
    has_maternity = Column(Boolean, default=True)
    has_csection = Column(Boolean, default=False)
    referral_capacity = Column(Boolean, default=False)
    is_waiting_home = Column(Boolean, default=False)
    waiting_capacity = Column(Integer, default=0)
    occupied_beds = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    facility_id = Column(UUID(as_uuid=True), ForeignKey("facilities.id"))
    patient_code = Column(String(50), nullable=False)
    age = Column(Integer)
    gestation_weeks = Column(Integer)
    gravida = Column(Integer)
    para = Column(Integer)
    previous_csection = Column(Boolean, default=False)
    multiple_pregnancy = Column(Boolean, default=False)
    known_conditions = Column(ARRAY(Text))
    enrollment_date = Column(DateTime)
    village = Column(String(100))
    distance_to_facility_km = Column(Float)
    has_transport = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"))
    midwife_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    assessment_time = Column(DateTime, server_default=func.now())
    
    # Inputs
    systolic_bp = Column(Integer)
    diastolic_bp = Column(Integer)
    temperature = Column(Float)
    bleeding_estimate_ml = Column(Integer)
    headache_severity = Column(Integer)
    visual_changes = Column(Boolean)
    abdominal_pain_severity = Column(Integer)
    foul_discharge = Column(Boolean)
    labour_hours = Column(Float)
    fever = Column(Boolean)
    
    # Outputs
    risk_level = Column(String(20))
    primary_condition = Column(String(50))
    confidence_score = Column(Float)
    explanation_text = Column(Text)
    shap_values = Column(JSON)
    
    # Actions
    actions_taken = Column(ARRAY(Text))
    referral_initiated = Column(Boolean, default=False)
    referral_facility_id = Column(UUID(as_uuid=True), ForeignKey("facilities.id"))
    patient_outcome = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())

class MaternalWaitingCenter(Base):
    __tablename__ = "maternal_waiting_centers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    district = Column(String(100))
    capacity = Column(Integer, default=10)
    occupied_beds = Column(Integer, default=0)
    latitude = Column(Float)
    longitude = Column(Float)
    phone = Column(String(20))
    has_ambulance = Column(Boolean, default=False)
    distance_to_emergency_facility_km = Column(Float)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

class HealthEconomicsEvent(Base):
    __tablename__ = "health_economics_events"
    
    id = Column(Integer, primary_key=True)
    risk_assessment_id = Column(UUID(as_uuid=True), ForeignKey("risk_assessments.id"))
    estimated_cost_standard_care = Column(Integer)
    estimated_dalys_standard_care = Column(Float)
    estimated_cost_ai_assisted = Column(Integer)
    estimated_dalys_averted = Column(Float)
    cost_savings = Column(Integer)
    dalys_averted_total = Column(Float)
    discount_rate = Column(Float, default=0.03)
    created_at = Column(DateTime, server_default=func.now())

class ReferralEvent(Base):
    __tablename__ = "referral_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"))
    source_facility_id = Column(UUID(as_uuid=True), ForeignKey("facilities.id"))
    destination_facility_id = Column(UUID(as_uuid=True), ForeignKey("facilities.id"))
    referral_time = Column(DateTime, server_default=func.now())
    arrival_time = Column(DateTime)
    referral_status = Column(String(20))
    referral_note = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
