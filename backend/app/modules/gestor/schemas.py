from typing import Optional, List, Any
from pydantic import BaseModel, Field, ConfigDict


class GestorResumenResponse(BaseModel):
    total_universidades: int
    total_carreras_unicas: int
    total_ofertas_activas: int
    total_carreras_inactivas: int
    total_pendientes_verificacion: int


class CarreraCrearRequest(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=255, description="Nombre oficial de la carrera")
    institucion: str = Field(..., min_length=2, max_length=255, description="Nombre de la universidad o escuela politécnica")
    siglas: str = Field(..., min_length=2, max_length=50, description="Siglas oficiales de la IES (ej. UPEC, UNEMI, EPN)")
    facultad: str = Field(..., min_length=2, max_length=255, description="Facultad o unidad académica oficial")
    modalidad: str = Field("Presencial", description="Presencial, En línea, Semipresencial, Híbrida")
    canton: str = Field("Quito", description="Cantón o ciudad de impartición")
    provincia: str = Field("Pichincha", description="Provincia de impartición")
    campus: Optional[str] = Field(None, description="Campus o sede específica")
    duracion_semestres: int = Field(9, ge=1, le=14, description="Duración en semestres")
    titulo_otorga: Optional[str] = Field(None, description="Título profesional que otorga")
    enlace_oficial: Optional[str] = Field(None, description="Enlace web oficial del programa")
    fuente_facultad: Optional[str] = Field(None, description="Fuente de verificación institucional")
    periodo_puntaje: Optional[str] = Field("2026", description="Período académico o de corte")
    estado_verificacion: Optional[str] = Field("Oferta de grado verificada 2026", description="Estado de verificación")
    observaciones: Optional[str] = Field(None, description="Observaciones y detalles de sedes/modalidades")


class CarreraActualizarRequest(BaseModel):
    nombre: Optional[str] = None
    institucion: Optional[str] = None
    siglas: Optional[str] = None
    facultad: Optional[str] = None
    modalidad: Optional[str] = None
    canton: Optional[str] = None
    provincia: Optional[str] = None
    campus: Optional[str] = None
    duracion_semestres: Optional[int] = Field(None, ge=1, le=14)
    titulo_otorga: Optional[str] = None
    enlace_oficial: Optional[str] = None
    fuente_facultad: Optional[str] = None
    periodo_puntaje: Optional[str] = None
    estado_verificacion: Optional[str] = None
    observaciones: Optional[str] = None


class CarreraCambiarEstadoRequest(BaseModel):
    es_vigente: bool


class FacultadRenombrarRequest(BaseModel):
    siglas: str = Field(..., description="Sigla de la universidad (ej. UPEC)")
    facultad_antigua: str = Field(..., description="Nombre actual de la facultad")
    facultad_nueva: str = Field(..., description="Nuevo nombre oficial de la facultad")


class FacultadItemResponse(BaseModel):
    siglas: str
    institucion: str
    facultad: str
    total_carreras: int
    respaldo: Optional[str] = None
