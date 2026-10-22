import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.api.v1.dependencies import get_current_user
from src.models.usuario import Usuario
from src.models.evaluacion import Evaluacion
from src.schemas.evaluacion import (
    EnviarRespuestasRequest,
    EvaluacionResponse,
    CarreraSugerida,
    RecomendacionesPedagogicas,
)
from src.services.evaluacion_service import (
    validar_respuestas_cuestionario,
    calcular_puntuaciones_vocacionales,
    recomendar_carreras,
    generar_recomendaciones_pedagogicas,
)

router = APIRouter(prefix="/evaluaciones", tags=["Evaluaciones"])


@router.post(
    "",
    response_model=EvaluacionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enviar respuestas del cuestionario y generar evaluación vocacional"
)
@router.post(
    "/",
    response_model=EvaluacionResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False
)
def crear_evaluacion(
    datos: EnviarRespuestasRequest,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Procesa las 20 respuestas Likert, calcula puntuaciones vocacionales de 10 áreas,
    genera recomendaciones y persiste atómicamente la evaluación en PostgreSQL (ADR-002, E2).
    """
    try:
        validar_respuestas_cuestionario(datos.respuestas)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )

    calculo = calcular_puntuaciones_vocacionales(datos.respuestas)
    area_predominante = calculo["area_predominante"]
    puntuaciones = calculo["puntuaciones"]
    es_empate = calculo["es_empate"]
    areas_empatadas = calculo["areas_empatadas"]
    todas_cero = calculo["todas_cero"]
    mensaje_resultado = calculo["mensaje_resultado"]

    provincia = usuario_actual.perfil.provincia if usuario_actual.perfil else "Pichincha"
    ciudad = usuario_actual.perfil.ciudad if usuario_actual.perfil else "Quito"

    carreras_data = recomendar_carreras(area_predominante, provincia=provincia, todas_cero=todas_cero)
    carreras_sugeridas = [CarreraSugerida(**c) for c in carreras_data]

    recs_data = generar_recomendaciones_pedagogicas(area_predominante, es_empate=es_empate, areas_empatadas=areas_empatadas)
    recomendaciones = RecomendacionesPedagogicas(**recs_data)

    try:
        nueva_evaluacion = Evaluacion(
            usuario_id=usuario_actual.id,
            version_cuestionario="3.0-20preguntas",
            respuestas_json=datos.respuestas,
            puntuaciones_areas=puntuaciones,
            area_predominante=area_predominante,
            areas_empatadas=areas_empatadas,
            es_empate=es_empate,
            carreras_sugeridas=[c.model_dump() for c in carreras_sugeridas],
        )
        db.add(nueva_evaluacion)
        db.flush()  # Escritura real en la transacción de PostgreSQL antes de commit

        # Inyección controlada de fallo para verificación de rollback (Escenario E2)
        if os.getenv("INDUCIR_FALLO_TRANSACCION_E2", "false").lower() == "true":
            raise RuntimeError("Fallo transaccional inducido tras escritura en PostgreSQL (E2)")

        db.commit()
        db.refresh(nueva_evaluacion)
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en persistencia transaccional: {str(exc)}"
        )

    return EvaluacionResponse(
        id=nueva_evaluacion.id,
        usuario_id=usuario_actual.id,
        creado_en=nueva_evaluacion.creado_en,
        area_predominante=area_predominante,
        puntuaciones_areas=puntuaciones,
        es_empate=es_empate,
        areas_empatadas=areas_empatadas,
        todas_cero=todas_cero,
        mensaje_resultado=mensaje_resultado,
        version_cuestionario=nueva_evaluacion.version_cuestionario,
        max_puntos_por_area=8,
        provincia_origen=provincia,
        ciudad_origen=ciudad,
        carreras_sugeridas=carreras_sugeridas,
        recomendaciones=recomendaciones,
    )


@router.get(
    "/ultima",
    response_model=Optional[EvaluacionResponse],
    summary="Consultar la última evaluación realizada por el estudiante autenticado"
)
def obtener_ultima_evaluacion(
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna la evaluación más reciente persistida exclusivamente para el usuario autenticado (ADR-001, E1, E3).
    Si el estudiante no tiene evaluaciones, retorna null con HTTP 200.
    """
    evaluacion = (
        db.query(Evaluacion)
        .filter(Evaluacion.usuario_id == usuario_actual.id)
        .order_by(Evaluacion.creado_en.desc())
        .first()
    )
    if not evaluacion:
        return None

    provincia = usuario_actual.perfil.provincia if usuario_actual.perfil else "Pichincha"
    ciudad = usuario_actual.perfil.ciudad if usuario_actual.perfil else "Quito"

    carreras_objs = [CarreraSugerida(**c) for c in (evaluacion.carreras_sugeridas or [])]
    recs_data = generar_recomendaciones_pedagogicas(
        evaluacion.area_predominante,
        es_empate=evaluacion.es_empate,
        areas_empatadas=evaluacion.areas_empatadas or [],
    )

    return EvaluacionResponse(
        id=evaluacion.id,
        usuario_id=evaluacion.usuario_id,
        creado_en=evaluacion.creado_en,
        area_predominante=evaluacion.area_predominante,
        puntuaciones_areas=evaluacion.puntuaciones_areas or {},
        es_empate=evaluacion.es_empate,
        areas_empatadas=evaluacion.areas_empatadas or [],
        todas_cero=all(v == 0 for v in evaluacion.puntuaciones_areas.values()) if evaluacion.puntuaciones_areas else False,
        mensaje_resultado=f"Última evaluación registrada ({evaluacion.area_predominante})",
        version_cuestionario=evaluacion.version_cuestionario,
        max_puntos_por_area=8,
        provincia_origen=provincia,
        ciudad_origen=ciudad,
        carreras_sugeridas=carreras_objs,
        recomendaciones=RecomendacionesPedagogicas(**recs_data),
    )
