from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.core.database import engine
from app.api import assessments, referrals, facilities, economics, waiting_centers, access_risk, patients, auth

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Schema is owned by Alembic migrations now (see services/api-gateway/alembic/), run as a release
    # step before the app starts — never inside the request-serving process. This check is just a
    # log line, not a schema-creation call: the old `Base.metadata.create_all(bind=engine)` ran at
    # *import time*, unconditionally, with no timeout, so if the database was ever unreachable (an
    # expired free-tier database, a network blip) the whole process hung forever before it could even
    # bind a port — Render showed this as a connection that accepted TCP but never returned a single
    # HTTP response, including on /health. A DB hiccup here is logged and the app still starts; the
    # connect_timeout on the engine (core/database.py) makes any actual query fail in ~10s instead of
    # hanging, and callers see a real 500/503 instead of the process never responding at all.
    try:
        with engine.connect():
            logger.info("Database connection OK")
    except Exception as exc:
        logger.error("Database is not reachable at startup: %s", exc)
    yield


app = FastAPI(
    title="MAMA-AI API",
    description="AI-Powered Maternal Emergency, Referral, and Safe Birth Ecosystem",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS: a real, specific origin list from the environment — see core/config.py. allow_origins=["*"]
# combined with allow_credentials=True (the previous setting) is meaningless in real browsers anyway
# (they refuse to echo "*" back once credentials are involved), and would be a real hole if a browser
# ever did honor it, since every route here that returns patient data now expects a Bearer token.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
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
