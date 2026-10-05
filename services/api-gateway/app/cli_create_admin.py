"""Create the first administrator from the command line. Self-registration can no longer create admins.

Usage (values come from the environment, never from the command line, so they stay out of shell history):
    ADMIN_PHONE=0244000000 ADMIN_NAME="Full Name" ADMIN_PASSWORD="at least 8 characters" python -m app.cli_create_admin
"""
import os
import sys

from app.core.auth import hash_password
from app.core.database import SessionLocal
from app.enums import Role
from app.models import User


def main() -> int:
    phone, name, password = os.environ.get("ADMIN_PHONE", ""), os.environ.get("ADMIN_NAME", ""), os.environ.get("ADMIN_PASSWORD", "")
    if not phone or not name or len(password) < 8:
        print("Set ADMIN_PHONE, ADMIN_NAME and ADMIN_PASSWORD (password of at least 8 characters).", file=sys.stderr)
        return 2
    db = SessionLocal()
    try:
        if db.query(User).filter(User.phone_number == phone).first():
            print("A user with that phone number already exists; nothing was changed.", file=sys.stderr)
            return 1
        db.add(User(phone_number=phone, full_name=name, password_hash=hash_password(password), role=Role.ADMIN.value))
        db.commit()
        print("Administrator created.")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
