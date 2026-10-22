# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from nexora_server_stubs.models.enviar_respuestas_request import EnviarRespuestasRequest  # noqa: F401
from nexora_server_stubs.models.error_response import ErrorResponse  # noqa: F401
from nexora_server_stubs.models.evaluacion_response import EvaluacionResponse  # noqa: F401
from nexora_server_stubs.models.ultima_evaluacion_response import UltimaEvaluacionResponse  # noqa: F401
from nexora_server_stubs.models.validation_error_response import ValidationErrorResponse  # noqa: F401


def test_crear_evaluacion(client: TestClient):
    """Test case for crear_evaluacion

    Enviar respuestas del cuestionario y generar evaluación vocacional
    """
    enviar_respuestas_request = {"respuestas":{"1":4,"2":3,"3":4,"4":2,"5":1,"6":0,"7":4,"8":3,"9":2,"10":1,"11":4,"12":3,"13":2,"14":4,"15":1,"16":0,"17":3,"18":4,"19":2,"20":4}}

    headers = {
        "Authorization": "Bearer special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/api/v1/evaluaciones",
    #    headers=headers,
    #    json=enviar_respuestas_request,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_obtener_ultima_evaluacion(client: TestClient):
    """Test case for obtener_ultima_evaluacion

    Consultar la última evaluación realizada por el estudiante autenticado
    """

    headers = {
        "Authorization": "Bearer special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/api/v1/evaluaciones/ultima",
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

