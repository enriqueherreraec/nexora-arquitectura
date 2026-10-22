# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from nexora_server_stubs.apis.informes_api_base import BaseInformesApi
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
from nexora_server_stubs.models.informe_envio_response import InformeEnvioResponse
from nexora_server_stubs.models.extra_models import TokenModel  # noqa: F401
from nexora_server_stubs.security_api import get_token_bearerAuth

router = APIRouter()

ns_pkg = nexora_server_stubs.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.post(
    "/api/v1/informes/{id}/enviar-correo",
    responses={
        200: {"model": InformeEnvioResponse, "description": "Informe PDF generado y enviado satisfactoriamente al buzón del estudiante."},
        401: {"model": ErrorResponse, "description": "Solicitante no autenticado."},
        404: {"model": ErrorResponse, "description": "Evaluación no encontrada o no autorizada para la cuenta en sesión (aislamiento ADR-001)."},
        503: {"model": ErrorResponse, "description": "Fallo controlado del proveedor de correo SMTP (continuidad del servicio según E5)."},
    },
    tags=["Informes"],
    summary="Despachar informe vocacional en PDF al correo de la cuenta",
    response_model_by_alias=True,
)
async def enviar_informe_correo(
    id: Annotated[int, Field(ge=1, description="Identificador numérico único de la evaluación a despachar.")] = Path(..., description="Identificador numérico único de la evaluación a despachar.", ge=1, examples=[501]),
    token_bearerAuth: TokenModel = Security(
        get_token_bearerAuth
    ),
) -> InformeEnvioResponse:
    """Verifica la propiedad estricta del recurso sobre el identificador de la evaluación, genera en memoria el informe oficial en formato PDF mediante ReportLab y despacha el documento adjunto hacia la dirección de correo registrada mediante SMTP."""
    if not BaseInformesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseInformesApi.subclasses[0]().enviar_informe_correo(id)
