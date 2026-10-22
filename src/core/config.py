import os
import urllib.parse
from typing import List


def _load_env_file(filepath: str = ".env") -> None:
    """
    Carga variables de entorno explícitamente desde un archivo .env si existe,
    sin sobreescribir las variables ya presentes en os.environ del sistema.
    """
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if k and k not in os.environ:
                        os.environ[k] = v
        except Exception:
            pass


_load_env_file()


class Settings:
    PROJECT_NAME: str = "Nexora API - Orientación Vocacional"
    PROJECT_VERSION: str = "0.2.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", "8002"))
    API_V1_PREFIX: str = "/api/v1"

    # Seguridad JWT: se exige configuración explícita fuera de pruebas
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    # Base de datos PostgreSQL: configuración mediante variables de entorno
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("PGPASSWORD", os.getenv("DB_PASSWORD", ""))
    DB_NAME: str = os.getenv("DB_NAME", "nexora_semana2")
    DATABASE_URL: str | None = os.getenv("DATABASE_URL", None)

    # Simulación de correo (desactivada por defecto; solo activa en testing con activación explícita)
    MODO_PRUEBAS_SIMULACION_CORREO: bool = os.getenv("MODO_PRUEBAS_SIMULACION_CORREO", "false").lower() == "true"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4010",
    ]

    # SMTP
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "nexora.orientacion@gmail.com")
    SMTP_TIMEOUT_SECONDS: int = int(os.getenv("SMTP_TIMEOUT_SECONDS", "3"))

    def __init__(self):
        # Exigir clave secreta fuera del entorno de pruebas
        if self.ENVIRONMENT != "testing" and not self.SECRET_KEY:
            raise RuntimeError(
                "SEGURIDAD CRÍTICA: SECRET_KEY no está configurada. "
                "Defina la variable de entorno SECRET_KEY (por ejemplo en un archivo .env) "
                "con una clave de al menos 32 caracteres para iniciar el servicio."
            )

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        safe_pass = urllib.parse.quote_plus(self.DB_PASSWORD) if self.DB_PASSWORD else ""
        pass_part = f":{safe_pass}" if safe_pass else ""
        return f"postgresql+psycopg2://{self.DB_USER}{pass_part}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


settings = Settings()
