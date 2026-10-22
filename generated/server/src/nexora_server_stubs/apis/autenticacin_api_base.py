# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field
from typing_extensions import Annotated
from nexora_server_stubs.models.error_response import ErrorResponse
from nexora_server_stubs.models.login_request import LoginRequest
from nexora_server_stubs.models.token_response import TokenResponse
from nexora_server_stubs.models.validation_error_response import ValidationErrorResponse


class BaseAutenticacinApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseAutenticacinApi.subclasses = BaseAutenticacinApi.subclasses + (cls,)
    async def iniciar_sesion(
        self,
        login_request: Annotated[LoginRequest, Field(description="Credenciales de acceso del usuario registrado.")],
    ) -> TokenResponse:
        """Valida las credenciales del estudiante contra el repositorio seguro y retorna un token JWT de tipo Bearer junto con los datos del usuario autenticado."""
        ...
