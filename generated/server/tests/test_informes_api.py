# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from nexora_server_stubs.models.error_response import ErrorResponse  # noqa: F401
from nexora_server_stubs.models.informe_envio_response import InformeEnvioResponse  # noqa: F401


def test_enviar_informe_correo(client: TestClient):
    """Test case for enviar_informe_correo

    Despachar informe vocacional en PDF al correo de la cuenta
    """

    headers = {
        "Authorization": "Bearer special-key",
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/api/v1/informes/{id}/enviar-correo".format(id=501),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

