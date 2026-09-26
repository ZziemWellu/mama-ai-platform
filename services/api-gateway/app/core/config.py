from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "MAMA-AI API"
    DEBUG: bool = False

    # No default — core/database.py already refuses to start without a real DATABASE_URL in the
    # environment; this field exists so other modules can read the same settings object.
    DATABASE_URL: str = ""

    # A comma-separated origin list in the environment (e.g. ALLOWED_ORIGINS=https://mama-ai.vercel.app),
    # never a wildcard: this API sends credentials (the JWT via Authorization header from the browser's
    # fetch calls), and allow_origins=["*"] together with allow_credentials=True is both rejected by
    # browsers in practice and a real hole if it weren't. Local dev origins are the only hardcoded
    # fallback, so a missing env var fails obviously in production rather than silently opening CORS.
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8000,http://localhost:8501"

    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24  # a CHW/midwife's shift-long session, not a short web-app token

    class Config:
        env_file = ".env"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
