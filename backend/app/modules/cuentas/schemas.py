from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict


class PerfilBase(BaseModel):
    provincia: str = "Pichincha"
    ciudad: str = "Quito"
    modalidad_preferida: str = "Presencial"
    medio_transporte: str = "Transporte público"
    latitud_origen: Optional[float] = None
    longitud_origen: Optional[float] = None


class PerfilResponse(PerfilBase):
    id: int
    usuario_id: int

    model_config = ConfigDict(from_attributes=True)


class RegistroUsuarioRequest(BaseModel):
    nombre_completo: str = Field(..., min_length=3, max_length=150, description="Nombres y apellidos del estudiante")
    email: EmailStr = Field(..., description="Correo electrónico válido")
    password: str = Field(..., min_length=8, max_length=100, description="Contraseña mínima de 8 caracteres")
    provincia: Optional[str] = "Pichincha"
    ciudad: Optional[str] = "Quito"
    modalidad_preferida: Optional[str] = "Presencial"
    medio_transporte: Optional[str] = "Transporte público"

    @field_validator("password")
    @classmethod
    def validar_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La contraseña debe contener al menos 8 caracteres")
        return v

    @field_validator("nombre_completo")
    @classmethod
    def limpiar_nombre(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("El nombre completo debe tener al menos 3 caracteres")
        return v


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Correo electrónico registrado")
    password: str = Field(..., min_length=1, description="Contraseña")


class UsuarioResponse(BaseModel):
    id: int
    email: str
    nombre_completo: str
    activo: bool
    rol: str = "estudiante"
    creado_en: datetime
    perfil: Optional[PerfilResponse] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_seconds: int
    usuario: UsuarioResponse


class AdminCrearUsuarioRequest(BaseModel):
    nombre_completo: str = Field(..., min_length=3, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=8)
    rol: str = Field("gestor", description="Rol a asignar: estudiante, gestor, admin")

    @field_validator("rol")
    @classmethod
    def validar_rol(cls, v: str) -> str:
        v_clean = v.lower().strip()
        if v_clean not in {"estudiante", "gestor", "admin"}:
            raise ValueError("El rol debe ser 'estudiante', 'gestor' o 'admin'")
        return v_clean


class AdminActualizarRolRequest(BaseModel):
    rol: str = Field(..., description="Nuevo rol: estudiante, gestor, admin")

    @field_validator("rol")
    @classmethod
    def validar_rol(cls, v: str) -> str:
        v_clean = v.lower().strip()
        if v_clean not in {"estudiante", "gestor", "admin"}:
            raise ValueError("El rol debe ser 'estudiante', 'gestor' o 'admin'")
        return v_clean


class AdminActualizarEstadoRequest(BaseModel):
    activo: bool

