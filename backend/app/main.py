from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.core.config import settings
from app.api.v1 import api_router
from app.api.v1.health import health_check

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="API REST modular para el Sistema Web de Orientación Vocacional y Consulta de Universidades Públicas del Ecuador.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Compresión automática HTTP para respuestas JSON grandes (reduce transferencia hasta en un 95%)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Configuración de CORS para permitir solicitudes del Frontend (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoints de salud directos en la raíz /health y /salud
app.add_api_route("/health", health_check, methods=["GET"], tags=["Health"], include_in_schema=True)
app.add_api_route("/salud", health_check, methods=["GET"], tags=["Health"], include_in_schema=True)

# Routers versionados bajo /api/v1
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Bienvenido al Sistema web de orientación vocacional y consulta de universidades públicas del Ecuador",
        "docs": "/docs",
        "health": "/health",
        "salud": "/salud",
        "api_v1": settings.API_V1_PREFIX
    }
