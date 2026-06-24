#!/usr/bin/env python
"""
Create all database tables on Render using the unified Base.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base

# Import ALL models so they register with the Base
import app.models

def create_tables():
    print("=" * 60)
    print("MAMA-AI Database Table Creation")
    print("=" * 60)
    
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("❌ ERROR: DATABASE_URL environment variable is not set!")
        return
    
    print(f"✅ DATABASE_URL: {db_url[:30]}...")
    print(f"📋 Tables registered: {list(Base.metadata.tables.keys())}")
    print("Creating tables...")
    
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")
    
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
        tables = [row[0] for row in result]
        print(f"\n📋 Tables in database: {len(tables)}")
        for table in sorted(tables):
            print(f"  - {table}")

if __name__ == "__main__":
    create_tables()
