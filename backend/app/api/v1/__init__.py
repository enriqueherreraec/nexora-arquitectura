"""Router central v1 del API Nexora."""
from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.modules.cuentas.router import router as cuentas_router
from app.modules.perfiles.router import router as perfiles_router
from app.modules.catalogo.router import router as catalogo_router
from app.modules.cuestionario.router import router as cuestionario_router
from app.modules.evaluaciones.router import router as evaluaciones_router
from app.modules.informes.router import router as informes_router
from app.modules.favoritos.router import router as favoritos_router
from app.modules.gestor.router import router as gestor_router
from app.modules.cuentas.admin_router import router as admin_usuarios_router

api_router = APIRouter()

# Enrutador de salud y diagnóstico
api_router.include_router(health_router, tags=["Health"])

# Módulos del Sistema Nexora
api_router.include_router(cuentas_router)
api_router.include_router(admin_usuarios_router)
api_router.include_router(perfiles_router)
api_router.include_router(catalogo_router)
api_router.include_router(favoritos_router)
api_router.include_router(gestor_router)
api_router.include_router(cuestionario_router)
api_router.include_router(evaluaciones_router)
api_router.include_router(informes_router)
