from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict, StrictInt


class EnviarRespuestasRequest(BaseModel):
    respuestas: Dict[str, StrictInt] = Field(
        ...,
        description="Diccionario de 20 respuestas Likert (0 a 4 puntos) indexadas del '1' al '20'."
    )


class CarreraSugerida(BaseModel):
    nombre_carrera: str
    universidad: str
    provincia: str
    modalidad: str
    puntaje_afinidad: int


class RecomendacionesPedagogicas(BaseModel):
    enfoque_principal: str
    sugerencia_exploratoria: str


class EvaluacionResponse(BaseModel):
    id: int
    usuario_id: int
    creado_en: datetime
    area_predominante: str
    puntuaciones_areas: Dict[str, int]
    es_empate: bool = False
    areas_empatadas: List[str] = []
    todas_cero: bool = False
    mensaje_resultado: str
    version_cuestionario: str = "3.0-20preguntas"
    max_puntos_por_area: int = 8
    provincia_origen: str = "Pichincha"
    ciudad_origen: str = "Quito"
    carreras_sugeridas: List[CarreraSugerida] = []
    recomendaciones: RecomendacionesPedagogicas

    model_config = ConfigDict(from_attributes=True)


UltimaEvaluacionResponse = Optional[EvaluacionResponse]
