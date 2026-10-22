from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.core.database import engine, Base
from src.api.v1 import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestor de ciclo de vida del servicio: inicializa tablas si no es entorno testing."""
    if settings.ENVIRONMENT != "testing":
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="API REST modular para el Sistema Web de Orientación Vocacional Nexora (Semana 2).",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión del enrutador modular v1
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["Salud y Diagnóstico"])
def health_check():
    """Endpoint de comprobación de salud del servicio backend."""
    return {
        "status": "healthy",
        "service": "nexora-backend",
        "version": settings.PROJECT_VERSION,
        "database": "postgresql",
        "database_name": settings.DB_NAME,
    }


@app.get("/", tags=["Raíz"])
def root():
    """Ruta raíz de bienvenida e inspección de metadatos del servicio."""
    return {
        "message": "Bienvenido al servicio ejecutable de Nexora - Orientación Vocacional",
        "docs": "/docs",
        "health": "/health",
        "api_v1": settings.API_V1_PREFIX,
    }
