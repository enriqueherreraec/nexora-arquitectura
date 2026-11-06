from typing import Generator, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
from app.core.config import settings

Base = declarative_base()


def get_engine():
    """Crea o retorna el engine de SQLAlchemy con timeout seguro."""
    db_url = settings.get_database_url()
    return create_engine(
        db_url,
        pool_pre_ping=True,
        connect_args={"connect_timeout": 3} if "postgresql" in db_url else {}
    )


# Engine inicial
engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def reset_engine():
    """Permite reiniciar el engine si se recargan las credenciales."""
    global engine, SessionLocal
    engine = get_engine()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator:
    """Dependencia para inyección de sesiones de base de datos en endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> Dict[str, Any]:
    """
    Verifica de forma segura la conexión con PostgreSQL sin exponer
    detalles sensibles ni fallar si la clave aún no está configurada.
    """
    # Si no hay DATABASE_URL ni contraseña configurada
    if not settings.DATABASE_URL and (not settings.DB_PASSWORD or settings.DB_PASSWORD == "escriba_aqui_su_contraseña_local"):
        return {
            "connected": False,
            "status": "pending_configuration",
            "message": "Credenciales de PostgreSQL pendientes de configuración en backend/.env.",
            "database": settings.DB_NAME
        }

    try:
        # Prueba de conexión rápida
        test_engine = get_engine()
        with test_engine.connect() as connection:
            connection.execute(text("SELECT 1;"))
            return {
                "connected": True,
                "status": "connected",
                "message": "Conexión activa con la base de datos PostgreSQL.",
                "database": settings.DB_NAME
            }
    except SQLAlchemyError:
        return {
            "connected": False,
            "status": "connection_error",
            "message": "No se pudo conectar a PostgreSQL. Compruebe el servicio local y la contraseña en backend/.env.",
            "database": settings.DB_NAME
        }
    except Exception:
        return {
            "connected": False,
            "status": "connection_error",
            "message": "Error al verificar la disponibilidad de la base de datos.",
            "database": settings.DB_NAME
        }
