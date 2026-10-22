# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from nexora_server_stubs.apis.evaluaciones_api_base import BaseEvaluacionesApi
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
from nexora_server_stubs.models.enviar_respuestas_request import EnviarRespuestasRequest
from nexora_server_stubs.models.error_response import ErrorResponse
from nexora_server_stubs.models.evaluacion_response import EvaluacionResponse
from nexora_server_stubs.models.ultima_evaluacion_response import UltimaEvaluacionResponse
from nexora_server_stubs.models.validation_error_response import ValidationErrorResponse
from nexora_server_stubs.models.extra_models import TokenModel  # noqa: F401
from nexora_server_stubs.security_api import get_token_bearerAuth

router = APIRouter()

ns_pkg = nexora_server_stubs.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.post(
    "/api/v1/evaluaciones",
    responses={
        201: {"model": EvaluacionResponse, "description": "Evaluación registrada exitosamente con resultados calculados."},
        400: {"model": ErrorResponse, "description": "Solicitud incompleta (respuestas insuficientes para las 20 preguntas)."},
        401: {"model": ErrorResponse, "description": "Token de autenticación ausente, vencido o no válido."},
        422: {"model": ValidationErrorResponse, "description": "Error de tipo o validación en las respuestas enviadas."},
    },
    tags=["Evaluaciones"],
    summary="Enviar respuestas del cuestionario y generar evaluación vocacional",
    response_model_by_alias=True,
)
async def crear_evaluacion(
    enviar_respuestas_request: Annotated[EnviarRespuestasRequest, Field(description="Diccionario con las 20 respuestas Likert indexadas por el número de pregunta (1 a 20).")] = Body(..., description="Diccionario con las 20 respuestas Likert indexadas por el número de pregunta (1 a 20).", examples=[{"respuestas": {"1": 4, "2": 3, "3": 4, "4": 2, "5": 1, "6": 0, "7": 4, "8": 3, "9": 2, "10": 1, "11": 4, "12": 3, "13": 2, "14": 4, "15": 1, "16": 0, "17": 3, "18": 4, "19": 2, "20": 4}}]),
    token_bearerAuth: TokenModel = Security(
        get_token_bearerAuth
    ),
) -> EvaluacionResponse:
    """Procesa exactamente 20 respuestas en escala Likert (valores de 0 a 4), calcula las puntuaciones en 10 áreas vocacionales, determina las carreras sugeridas y persiste el intento en PostgreSQL de forma atómica."""
    if not BaseEvaluacionesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseEvaluacionesApi.subclasses[0]().crear_evaluacion(enviar_respuestas_request)


@router.get(
    "/api/v1/evaluaciones/ultima",
    responses={
        200: {"model": UltimaEvaluacionResponse, "description": "Última evaluación encontrada o resultado nulo si no tiene historial previo."},
        401: {"model": ErrorResponse, "description": "Token de autenticación ausente o inválido."},
    },
    tags=["Evaluaciones"],
    summary="Consultar la última evaluación realizada por el estudiante autenticado",
    response_model_by_alias=True,
)
async def obtener_ultima_evaluacion(
    token_bearerAuth: TokenModel = Security(
        get_token_bearerAuth
    ),
) -> UltimaEvaluacionResponse:
    """Recupera la evaluación más reciente persistida para la cuenta en sesión, garantizando aislamiento de datos conforme al driver D1 y ADR-001. Retorna null si el estudiante aún no ha completado ninguna evaluación."""
    if not BaseEvaluacionesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseEvaluacionesApi.subclasses[0]().obtener_ultima_evaluacion()
