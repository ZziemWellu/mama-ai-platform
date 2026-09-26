import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Force DATABASE_URL from environment - NO FALLBACK!
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set!")

# connect_timeout matters as much as pool_pre_ping/pool_recycle here: without it, a database that's
# unreachable (paused, expired, network partition) makes psycopg2 hang indefinitely on connect, which
# used to take the whole app down with it — main.py used to run a blocking schema-creation call at
# import time with no timeout, so an unreachable DB meant the process never finished booting and never
# served so much as /health. That call is gone now (see main.py's lifespan + Alembic migrations
# instead), but the timeout stays here too since every request-time connection attempt deserves the
# same fail-fast behavior.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Check connection before using
    pool_recycle=300,    # Recycle connections every 5 minutes
    connect_args={"connect_timeout": 10},
    echo=False           # Set to True for debugging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
