from enum import Enum

class PrimaryCondition(str, Enum):
    NORMAL = "NORMAL"
    PPH = "PPH"
    PRE_ECLAMPSIA = "PRE_ECLAMPSIA"
    OBSTRUCTED_LABOUR = "OBSTRUCTED_LABOUR"
    SEPSIS = "SEPSIS"
    NONE = "NONE"
    SUSPECTED_COMPLICATION = "Suspected complication"

class RiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

# Matches the DB CHECK constraint on users.role (database/migrations/001_initial_schema.sql) — that
# constraint existed from the start, but nothing in the Python code enforced or even referenced it,
# so app/api/auth.py accepted any string as a role.
class Role(str, Enum):
    ADMIN = "ADMIN"
    MIDWIFE = "MIDWIFE"
    DISTRICT_HEALTH_OFFICER = "DISTRICT_HEALTH_OFFICER"
    COMMUNITY_HEALTH_WORKER = "COMMUNITY_HEALTH_WORKER"
