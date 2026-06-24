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
