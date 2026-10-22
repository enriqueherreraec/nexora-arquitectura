# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from nexora_server_stubs.apis.autenticacin_api_base import BaseAutenticacinApi
import nexora_server_stubs.impl

from fastapi import (  # noqa: F401
    APIRouter,
    Body,
    Cookie,
    Depends,
    Form,
    Header,
    HTTPException,
    Path,
    Query,
    Response,
    Security,
    status,
)

from pydantic import Field
from typing_extensions import Annotated
from nexora_server_stubs.models.error_response import ErrorResponse
from nexora_server_stubs.models.login_request import LoginRequest
from nexora_server_stubs.models.token_response import TokenResponse
from nexora_server_stubs.models.validation_error_response import ValidationErrorResponse

router = APIRouter()

ns_pkg = nexora_server_stubs.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.post(
    "/api/v1/auth/login",
    responses={
        200: {"model": TokenResponse, "description": "Autenticación satisfactoria y emisión de token JWT."},
        401: {"model": ErrorResponse, "description": "Credenciales incorrectas o usuario no registrado."},
        403: {"model": ErrorResponse, "description": "Cuenta desactivada por el administrador."},
        422: {"model": ValidationErrorResponse, "description": "Error de validación sintáctica en el cuerpo de la solicitud."},
    },
    tags=["Autenticación"],
    summary="Iniciar sesión con correo y contraseña",
    response_model_by_alias=True,
)
async def iniciar_sesion(
    login_request: Annotated[LoginRequest, Field(description="Credenciales de acceso del usuario registrado.")] = Body(..., description="Credenciales de acceso del usuario registrado.", examples=[{"email": "estudiante.demo@ejemplo.edu.ec", "password": "ClaveSegura2026."}]),
) -> TokenResponse:
    """Valida las credenciales del estudiante contra el repositorio seguro y retorna un token JWT de tipo Bearer junto con los datos del usuario autenticado."""
    if not BaseAutenticacinApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseAutenticacinApi.subclasses[0]().iniciar_sesion(login_request)
