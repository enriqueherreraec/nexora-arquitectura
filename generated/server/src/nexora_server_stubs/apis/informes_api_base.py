# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field
from typing_extensions import Annotated
from nexora_server_stubs.models.error_response import ErrorResponse
from nexora_server_stubs.models.informe_envio_response import InformeEnvioResponse
from nexora_server_stubs.security_api import get_token_bearerAuth

class BaseInformesApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseInformesApi.subclasses = BaseInformesApi.subclasses + (cls,)
    async def enviar_informe_correo(
        self,
        id: Annotated[int, Field(ge=1, description="Identificador numérico único de la evaluación a despachar.")],
    ) -> InformeEnvioResponse:
        """Verifica la propiedad estricta del recurso sobre el identificador de la evaluación, genera en memoria el informe oficial en formato PDF mediante ReportLab y despacha el documento adjunto hacia la dirección de correo registrada mediante SMTP."""
        ...
