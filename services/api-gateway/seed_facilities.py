#!/usr/bin/env python
"""Seeds real Ghana health facilities from data/ghana_health_facilities.csv, sourced from the
Ghana Healthsites dataset on the Humanitarian Data Exchange (OpenStreetMap-derived, filtered to
named hospitals/clinics/doctors' offices with coordinates inside Ghana's bounding box — see
clean_facilities step referenced in the PR that added this file).

Name, type, latitude/longitude and district come from that real dataset. has_csection,
has_ambulance and has_icu are NOT in the source data and are deliberately left at their default of
False rather than guessed — an app that wrongly tells a CHW a facility can do a C-section when it
can't is far more dangerous than one that under-claims. Run this again any time; it's idempotent
(skips any facility whose name already exists).
"""
import csv
import os
import sys
import uuid

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models import Facility

CSV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "ghana_health_facilities.csv")


def seed_facilities():
    db = SessionLocal()
    try:
        existing_names = {name for (name,) in db.query(Facility.name).all()}
        created = 0
        with open(CSV_PATH, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row["name"] in existing_names:
                    continue
                db.add(Facility(
                    id=uuid.uuid4(),
                    name=row["name"],
                    type=row["type"],
                    district=row["district"] or None,
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"]),
                ))
                created += 1
        db.commit()
        print(f"Seeded {created} new facilities ({len(existing_names)} already present, skipped).")
    finally:
        db.close()


if __name__ == "__main__":
    seed_facilities()
