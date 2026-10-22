# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field
from typing_extensions import Annotated
from nexora_server_stubs.models.enviar_respuestas_request import EnviarRespuestasRequest
from nexora_server_stubs.models.error_response import ErrorResponse
from nexora_server_stubs.models.evaluacion_response import EvaluacionResponse
from nexora_server_stubs.models.ultima_evaluacion_response import UltimaEvaluacionResponse
from nexora_server_stubs.models.validation_error_response import ValidationErrorResponse
from nexora_server_stubs.security_api import get_token_bearerAuth

class BaseEvaluacionesApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseEvaluacionesApi.subclasses = BaseEvaluacionesApi.subclasses + (cls,)
    async def crear_evaluacion(
        self,
        enviar_respuestas_request: Annotated[EnviarRespuestasRequest, Field(description="Diccionario con las 20 respuestas Likert indexadas por el número de pregunta (1 a 20).")],
    ) -> EvaluacionResponse:
        """Procesa exactamente 20 respuestas en escala Likert (valores de 0 a 4), calcula las puntuaciones en 10 áreas vocacionales, determina las carreras sugeridas y persiste el intento en PostgreSQL de forma atómica."""
        ...


    async def obtener_ultima_evaluacion(
        self,
    ) -> UltimaEvaluacionResponse:
        """Recupera la evaluación más reciente persistida para la cuenta en sesión, garantizando aislamiento de datos conforme al driver D1 y ADR-001. Retorna null si el estudiante aún no ha completado ninguna evaluación."""
        ...
