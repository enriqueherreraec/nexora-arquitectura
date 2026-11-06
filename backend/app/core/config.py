import json
import urllib.parse
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexora - Sistema web de orientación vocacional y consulta de universidades públicas del Ecuador"
    PROJECT_VERSION: str = "0.3.0"
    ENVIRONMENT: str = "development"
    PORT: int = 8002
    API_V1_PREFIX: str = "/api/v1"

    # Seguridad JWT & Argon2
    SECRET_KEY: str = "nexora_jwt_secret_key_ec_academico_2026_segura_32caracteres"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    # Base de Datos PostgreSQL
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""
    DB_NAME: str = "orientacion_vocacional_db"
    DATABASE_URL: str | None = None

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://nexora-frontend.onrender.com",
    ]

    # Configuración de Servidor de Correo SMTP (Envío real de Informes PDF)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = "Nexora - Orientación Vocacional"
    SMTP_USE_TLS: bool = True
    SMTP_USE_SSL: bool = False

    @field_validator("DB_PASSWORD", mode="before")
    @classmethod
    def clean_db_password(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator("SMTP_PASSWORD", mode="before")
    @classmethod
    def clean_smtp_password(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip()
            # Si se pegó una contraseña de aplicación de Google con espacios ("xxxx xxxx xxxx xxxx"),
            # se limpian los espacios para que smtplib reciba los 16 caracteres continuos.
            if len(cleaned.replace(" ", "")) == 16 and " " in cleaned:
                return cleaned.replace(" ", "")
            return cleaned
        return v

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+psycopg2://", 1)
            elif url.startswith("postgresql://") and not url.startswith("postgresql+psycopg2://"):
                url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return url
        # Escapar contraseña para caracteres especiales
        safe_password = urllib.parse.quote_plus(self.DB_PASSWORD) if self.DB_PASSWORD else ""
        password_part = f":{safe_password}" if safe_password else ""
        return f"postgresql+psycopg2://{self.DB_USER}{password_part}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    model_config = SettingsConfigDict(
        env_file=[str(ENV_PATH), ".env"],
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
