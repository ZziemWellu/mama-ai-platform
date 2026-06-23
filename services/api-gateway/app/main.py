from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import assessments, referrals

app = FastAPI(
    title="MAMA-AI API",
    description="AI-Powered Maternal Emergency Intelligence Platform for Rural Ghana",
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
app.include_router(assessments.router, prefix="/api/v1", tags=["Assessments"])
app.include_router(referrals.router, prefix="/api/v1/referrals", tags=["Referrals"])

@app.get("/")
async def root():
    return {
        "message": "MAMA-AI API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/v1/ping")
async def ping():
    return {"message": "pong", "environment": "mama-ai"}
