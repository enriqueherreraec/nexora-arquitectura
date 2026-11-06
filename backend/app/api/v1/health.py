import os
from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings
from app.core.database import check_db_connection

router = APIRouter()


def get_commit_hash() -> str:
    """Obtiene el hash del commit desde Render o variable de entorno."""
    return (
        os.getenv("RENDER_GIT_COMMIT")
        or os.getenv("GIT_COMMIT")
        or os.getenv("COMMIT_SHA")
        or "e0f11e7"
    )


@router.get("/health", summary="Diagnóstico de estado del servidor y base de datos")
@router.get("/salud", summary="Diagnóstico de estado del servidor y base de datos (alias en español)")
def health_check():
    """
    Retorna el estado de disponibilidad del sistema Nexora con versión y commit.
    Distingue claramente entre el servidor web activo y la conexión a la base de datos PostgreSQL.
    """
    db_diag = check_db_connection()
    is_db_connected = db_diag.get("connected", False)

    # Distinguir estado general
    overall_status = "operational" if is_db_connected else "degraded"
    commit_sha = get_commit_hash()

    return {
        "status": overall_status,
        "service": "nexora-backend",
        "version": settings.PROJECT_VERSION,
        "commit": commit_sha[:7],
        "commit_full": commit_sha,
        "server": {
            "status": "active",
            "name": settings.PROJECT_NAME,
            "version": settings.PROJECT_VERSION,
            "commit": commit_sha[:7],
            "port": settings.PORT,
            "environment": settings.ENVIRONMENT,
        },
        "database": {
            "connected": is_db_connected,
            "status": db_diag.get("status"),
            "message": db_diag.get("message"),
            "database_name": db_diag.get("database"),
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "modules": {
            "cuentas_autenticacion": "disponible",
            "perfiles": "disponible",
            "catalogo": "disponible",
            "cuestionario": "disponible",
            "evaluaciones": "disponible",
            "informes": "disponible",
            "favoritos": "disponible",
            "gestor_academico": "disponible",
            "admin_usuarios": "disponible",
        }
    }
