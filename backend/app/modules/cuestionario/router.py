from fastapi import APIRouter
from app.modules.cuestionario.data import (
    PREGUNTAS_VOCACIONALES,
    OPCIONES_LIKERT,
    INSTRUCCIONES_ESTUDIANTE,
    AREAS_VOCACIONALES_10,
)

router = APIRouter(prefix="/cuestionario", tags=["Cuestionario Vocacional"])


@router.get("/preguntas", summary="Obtener batería de reactivos vocacionales y escala de respuesta")
def obtener_preguntas():
    return {
        "instrucciones": INSTRUCCIONES_ESTUDIANTE,
        "areas": AREAS_VOCACIONALES_10,
        "total_areas": len(AREAS_VOCACIONALES_10),
        "preguntas": PREGUNTAS_VOCACIONALES,
        "opciones": OPCIONES_LIKERT,
        "total_preguntas": len(PREGUNTAS_VOCACIONALES),
        "total_paginas": 4,
        "preguntas_por_pagina": 5,
        "version": "3.0-20preguntas",
    }
