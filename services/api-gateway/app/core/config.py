from typing import List

class Settings:
    APP_NAME: str = "MAMA-AI API"
    DEBUG: bool = True
    
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/mama_ai"
    
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8501",
        "*"
    ]

settings = Settings()
