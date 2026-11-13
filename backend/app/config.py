import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Online Hospital Appointment and Patient Management System"
    ENV: str = os.getenv("ENV", "development")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./hospital.db"  # Defaults to SQLite for immediate local plug-and-play, overrides to postgresql via env
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "hospital-jwt-secret-key-production-ready-2026-supersecure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    CORS_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

