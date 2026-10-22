from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class PerfilResponse(BaseModel):
    id: int
    usuario_id: int
    provincia: str = "Pichincha"
    ciudad: str = "Quito"
    modalidad_preferida: str = "Presencial"
    medio_transporte: str = "Transporte público"

    model_config = ConfigDict(from_attributes=True)


class UsuarioResponse(BaseModel):
    id: int
    email: EmailStr
    nombre_completo: str
    rol: str = "estudiante"
    activo: bool = True
    creado_en: datetime
    perfil: Optional[PerfilResponse] = None

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Correo electrónico registrado")
    password: str = Field(..., min_length=1, description="Contraseña de la cuenta")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    usuario: UsuarioResponse
