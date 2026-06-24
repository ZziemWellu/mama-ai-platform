from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.database import engine, Base
from app.api import assessments, referrals, facilities, economics, waiting_centers, access_risk, patients, auth

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables on startup
logger.info("Creating database tables...")
Base.metadata.create_all(bind=engine)
logger.info("Database tables created successfully!")

app = FastAPI(
    title="MAMA-AI API",
    description="AI-Powered Maternal Emergency, Referral, and Safe Birth Ecosystem",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(assessments.router, prefix="/api/v1/assessments", tags=["Assessments"])
app.include_router(referrals.router, prefix="/api/v1/referrals", tags=["Referrals"])
app.include_router(facilities.router, prefix="/api/v1/facilities", tags=["Facilities"])
app.include_router(economics.router, prefix="/api/v1/economics", tags=["Economics"])
app.include_router(waiting_centers.router, prefix="/api/v1/waiting-centers", tags=["Waiting Centers"])
app.include_router(access_risk.router, prefix="/api/v1/access-risk", tags=["Access Risk"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["Patients"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])

@app.get("/")
async def root():
    return {
        "message": "MAMA-AI API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/ping")
async def ping():
    return {"message": "pong"}

@app.get("/db-test")
async def db_test():
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT NOW()"))
        return {"database": str(result.scalar())}
