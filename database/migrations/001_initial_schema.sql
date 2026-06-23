-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(100),
    role VARCHAR(50) CHECK (role IN ('ADMIN', 'MIDWIFE', 'DISTRICT_HEALTH_OFFICER', 'COMMUNITY_HEALTH_WORKER')),
    facility_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Facilities
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Health Centre', 'District Hospital', 'CHPS Compound', 'Maternal Waiting Home')),
    region VARCHAR(50),
    district VARCHAR(100),
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    phone VARCHAR(20),
    has_ambulance BOOLEAN DEFAULT FALSE,
    has_maternity BOOLEAN DEFAULT TRUE,
    has_csection BOOLEAN DEFAULT FALSE,
    referral_capacity BOOLEAN DEFAULT FALSE,
    is_waiting_home BOOLEAN DEFAULT FALSE,
    waiting_capacity SMALLINT DEFAULT 0,
    occupied_beds SMALLINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID REFERENCES facilities(id),
    patient_code VARCHAR(50) NOT NULL,
    age SMALLINT,
    gestation_weeks SMALLINT,
    gravida SMALLINT,
    para SMALLINT,
    previous_csection BOOLEAN DEFAULT FALSE,
    multiple_pregnancy BOOLEAN DEFAULT FALSE,
    known_conditions TEXT[],
    enrollment_date TIMESTAMP,
    village VARCHAR(100),
    distance_to_facility_km DECIMAL(5,2),
    has_transport BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Risk Assessments
CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    midwife_id UUID REFERENCES users(id),
    assessment_time TIMESTAMP DEFAULT NOW(),
    systolic_bp SMALLINT,
    diastolic_bp SMALLINT,
    temperature DECIMAL(3,1),
    bleeding_estimate_ml SMALLINT,
    headache_severity SMALLINT CHECK (headache_severity BETWEEN 0 AND 10),
    visual_changes BOOLEAN,
    abdominal_pain_severity SMALLINT CHECK (abdominal_pain_severity BETWEEN 0 AND 10),
    foul_discharge BOOLEAN,
    labour_hours DECIMAL(4,1),
    fever BOOLEAN,
    risk_level VARCHAR(20) CHECK (risk_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    primary_condition VARCHAR(50) CHECK (primary_condition IN ('PPH', 'PRE_ECLAMPSIA', 'OBSTRUCTED_LABOUR', 'SEPSIS', 'NONE')),
    confidence_score DECIMAL(3,2),
    explanation_text TEXT,
    shap_values JSONB,
    actions_taken TEXT[],
    referral_initiated BOOLEAN DEFAULT FALSE,
    referral_facility_id UUID REFERENCES facilities(id),
    patient_outcome VARCHAR(50) CHECK (patient_outcome IN ('DIED', 'SURVIVED', 'TRANSFERRED', 'UNKNOWN')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Access Risk Assessments
CREATE TABLE access_risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    distance_to_facility_km DECIMAL(5,2),
    transport_available BOOLEAN,
    previous_complications BOOLEAN,
    gestation_weeks INTEGER,
    predicted_travel_time_minutes INTEGER,
    access_risk_level VARCHAR(20) CHECK (access_risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    recommended_waiting_center_id UUID REFERENCES facilities(id),
    recommended_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Maternal Waiting Centers
CREATE TABLE maternal_waiting_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    district VARCHAR(100),
    capacity INTEGER DEFAULT 10,
    occupied_beds INTEGER DEFAULT 0,
    latitude DECIMAL(10,6),
    longitude DECIMAL(10,6),
    phone VARCHAR(20),
    has_ambulance BOOLEAN DEFAULT FALSE,
    distance_to_emergency_facility_km DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Health Economics Events
CREATE TABLE health_economics_events (
    id SERIAL PRIMARY KEY,
    risk_assessment_id UUID REFERENCES risk_assessments(id),
    estimated_cost_standard_care INTEGER,
    estimated_dalys_standard_care DECIMAL(10,3),
    estimated_cost_ai_assisted INTEGER,
    estimated_dalys_averted DECIMAL(10,3),
    cost_savings INTEGER,
    dalys_averted_total DECIMAL(10,3),
    discount_rate DECIMAL(3,2) DEFAULT 0.03,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Referral Events
CREATE TABLE referral_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    source_facility_id UUID REFERENCES facilities(id),
    destination_facility_id UUID REFERENCES facilities(id),
    referral_time TIMESTAMP DEFAULT NOW(),
    arrival_time TIMESTAMP,
    referral_status VARCHAR(20) CHECK (referral_status IN ('PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED', 'FAILED')),
    referral_note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
