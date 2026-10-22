# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from nexora_server_stubs.models.error_response import ErrorResponse  # noqa: F401
from nexora_server_stubs.models.login_request import LoginRequest  # noqa: F401
from nexora_server_stubs.models.token_response import TokenResponse  # noqa: F401
from nexora_server_stubs.models.validation_error_response import ValidationErrorResponse  # noqa: F401


def test_iniciar_sesion(client: TestClient):
    """Test case for iniciar_sesion

    Iniciar sesión con correo y contraseña
    """
    login_request = {"email":"estudiante.demo@ejemplo.edu.ec","password":"ClaveSegura2026."}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/api/v1/auth/login",
    #    headers=headers,
    #    json=login_request,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

