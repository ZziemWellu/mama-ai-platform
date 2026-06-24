import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Force DATABASE_URL from environment - NO FALLBACK!
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set!")

# Create engine with proper settings for Render PostgreSQL
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Check connection before using
    pool_recycle=300,    # Recycle connections every 5 minutes
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
