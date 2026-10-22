from fastapi import APIRouter
from src.api.v1.auth import router as auth_router
from src.api.v1.evaluaciones import router as evaluaciones_router
from src.api.v1.informes import router as informes_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(evaluaciones_router)
api_v1_router.include_router(informes_router)
