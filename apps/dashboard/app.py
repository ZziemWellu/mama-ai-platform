import streamlit as st
import pandas as pd
import requests
import plotly.express as px
from datetime import datetime

st.set_page_config(page_title="MAMA-AI Dashboard", page_icon="🤰", layout="wide")

# API URL from secrets
API_URL = st.secrets.get("API_URL", "http://localhost:8000")

# Custom CSS
st.markdown("""
<style>
.metric-card { background: #f0fdf4; border-radius: 12px; padding: 1rem; margin: 0.5rem 0; border-left: 4px solid #22c55e; }
.metric-card-red { background: #fef2f2; border-left: 4px solid #ef4444; }
.metric-card-yellow { background: #fefce8; border-left: 4px solid #eab308; }
.metric-card-blue { background: #eff6ff; border-left: 4px solid #3b82f6; }
</style>
""", unsafe_allow_html=True)

st.title("🤰 MAMA-AI Maternal Health Intelligence")

# Role selector
role = st.radio("I am a:", ["👩‍⚕️ Midwife", "🏥 District Officer", "👩 Pregnant Woman"], horizontal=True)

# ============ MIDWIFE VIEW ============
if role == "👩‍⚕️ Midwife":
    st.subheader("📋 Today's Patients")
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown('<div class="metric-card"><strong>👩 Patients</strong><br><span style="font-size:2rem;">12</span></div>', unsafe_allow_html=True)
    with col2:
        st.markdown('<div class="metric-card metric-card-red"><strong>🚨 High Risk</strong><br><span style="font-size:2rem;">3</span></div>', unsafe_allow_html=True)
    with col3:
        st.markdown('<div class="metric-card metric-card-yellow"><strong>👶 In Labour</strong><br><span style="font-size:2rem;">4</span></div>', unsafe_allow_html=True)
    with col4:
        st.markdown('<div class="metric-card metric-card-blue"><strong>📊 Done Today</strong><br><span style="font-size:2rem;">8</span></div>', unsafe_allow_html=True)

    # Emergency Assessment
    with st.expander("🚨 New Emergency Assessment", expanded=True):
        col1, col2 = st.columns(2)
        with col1:
            patient_id = st.text_input("Patient ID", "P004")
            gestation = st.number_input("Gestation (weeks)", 20, 42, 38)
            bleeding = st.selectbox("Bleeding Volume", ["None", "<500mL", "500-1000mL", ">1000mL"])
        with col2:
            bp_sys = st.number_input("Systolic BP", 80, 220, 120)
            bp_dia = st.number_input("Diastolic BP", 50, 140, 80)
            headache = st.slider("Headache Severity", 0, 10, 0)
            fever = st.checkbox("Fever")

        if st.button("🚨 Assess Risk", use_container_width=True, type="primary"):
            bleeding_vol = 0 if bleeding == "None" else 300 if bleeding == "<500mL" else 600 if bleeding == "500-1000mL" else 1000
            request = {
                "patient_id": patient_id,
                "symptoms": {
                    "bleeding_volume": bleeding_vol,
                    "headache_severity": headache,
                    "visual_changes": headache >= 7,
                    "abdominal_pain_severity": 0,
                    "foul_discharge": False,
                    "fever": fever
                },
                "vitals": {
                    "systolic_bp": bp_sys,
                    "diastolic_bp": bp_dia,
                    "temperature": 37.5 if fever else 36.8
                },
                "obstetric_history": {
                    "gestation_weeks": gestation,
                    "labour_hours": 0,
                    "previous_csection": False,
                    "multiple_pregnancy": False
                }
            }
            
            try:
                response = requests.post(f"{API_URL}/api/v1/assessments/assess", json=request, timeout=10)
                if response.status_code == 200:
                    result = response.json()
                    risk_color = {"LOW": "🟢", "MODERATE": "🟡", "HIGH": "🟠", "CRITICAL": "🔴"}.get(result["risk_level"], "⚪")
                    st.markdown(f"""
                    <div style="background: {'#fef2f2' if result['risk_level'] == 'CRITICAL' else '#f0fdf4'}; padding: 1rem; border-radius: 12px; margin: 1rem 0;">
                        <h2>{risk_color} {result['risk_level']}: {result['primary_condition']}</h2>
                        <p><strong>Confidence:</strong> {result['confidence_score']*100:.0f}%</p>
                        <p><strong>Explanation:</strong> {result['explanation']}</p>
                        <p><strong>Actions:</strong></p>
                        <ul>{''.join(f'<li>{a}</li>' for a in result['recommended_actions'])}</ul>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.error(f"Error: {response.status_code} - {response.text}")
            except Exception as e:
                st.error(f"Connection error: {e}")

# ============ DISTRICT OFFICER VIEW ============
elif role == "🏥 District Officer":
    st.subheader("📊 District Health Intelligence")
    col1, col2, col3 = st.columns(3)
    with col1: st.metric("📍 High Risk Facilities", "4 of 12", delta="-1")
    with col2: st.metric("💰 Cost Savings (GHS)", "47,200", delta="+12%")
    with col3: st.metric("👶 DALYs Averted", "187", delta="+23")
    
    data = pd.DataFrame({'Facility': ['Ejura', 'Nkwanta', 'Mampong'], 'Cost Savings': [28400, 12600, 6200]})
    fig = px.bar(data, x='Facility', y='Cost Savings', title='Cost Savings by Facility', color='Cost Savings', color_continuous_scale='Greens')
    fig.update_layout(height=300)
    st.plotly_chart(fig, width="stretch")

# ============ PREGNANT WOMAN VIEW ============
else:
    st.subheader("🤰 Your Pregnancy Journey")
    col1, col2 = st.columns(2)
    with col1:
        st.markdown('<div class="metric-card metric-card-blue"><strong>📅 Gestation</strong><br><span style="font-size:2rem;">38 weeks</span></div>', unsafe_allow_html=True)
    with col2:
        st.markdown('<div class="metric-card metric-card-yellow"><strong>⏰ Estimated Delivery</strong><br><span style="font-size:2rem;">14 days</span></div>', unsafe_allow_html=True)
    
    st.info("📞 Contact your health worker immediately if you experience: Heavy bleeding, Severe headache, Fits, Difficulty breathing, Fever, Reduced baby movement")

st.markdown("---")
st.caption("MAMA-AI v1.0 | Powered by the CS-TC Framework | Built for Ghana AI Innovation Challenge 2026")
