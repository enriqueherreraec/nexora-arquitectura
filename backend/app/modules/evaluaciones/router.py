from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.cuentas.dependencies import require_estudiante
from app.modules.cuentas.models import Usuario
from app.modules.perfiles.models import Perfil
from app.modules.evaluaciones.models import Evaluacion
from app.modules.evaluaciones.service import (
    calcular_puntuaciones_vocacionales,
    recomendar_carreras,
    generar_recomendaciones_pedagogicas,
)

router = APIRouter(prefix="/evaluaciones", tags=["Evaluaciones Vocacionales"])


class EnviarRespuestasRequest(BaseModel):
    respuestas: Dict[str, int] = Field(
        ...,
        description="Diccionario de respuestas Likert (0 a 4 puntos) indexado por ID de pregunta (1 a 20)."
    )


@router.post("/", summary="Enviar respuestas del cuestionario y generar evaluación vocacional")
def crear_evaluacion(
    datos: EnviarRespuestasRequest,
    usuario_actual: Usuario = Depends(require_estudiante),
    db: Session = Depends(get_db)
):
    """
    Procesa las 20 respuestas Likert, calcula afinidades para las 10 áreas,
    maneja empates y ceros de forma no arbitraria, recomienda carreras pertinentes
    y guarda el intento nuevo en el historial sin recalcular evaluaciones previas.
    """
    if not datos.respuestas or len(datos.respuestas) < 20:
        faltantes = 20 - (len(datos.respuestas) if datos.respuestas else 0)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Debe responder las 20 preguntas del cuestionario antes de finalizar (faltan {faltantes})."
        )

    # 1. Calcular afinidades por área (10 áreas, 2 preguntas c/u, max 8 pts en v3)
    calculo = calcular_puntuaciones_vocacionales(datos.respuestas)
    puntuaciones = calculo["puntuaciones"]
    area_predominante = calculo["area_predominante"]
    es_empate = calculo["es_empate"]
    areas_empatadas = calculo["areas_empatadas"]
    todas_cero = calculo["todas_cero"]
    mensaje_resultado = calculo["mensaje_resultado"]
    version_cuestionario = calculo["version_cuestionario"]
    max_puntos_por_area = calculo.get("max_puntos_por_area", 8)

    # 2. Obtener provincia, ciudad, modalidad preferida y transporte del perfil del estudiante
    perfil = db.query(Perfil).filter(Perfil.usuario_id == usuario_actual.id).first()
    provincia = perfil.provincia if perfil else "Pichincha"
    ciudad = perfil.ciudad if perfil else "Quito"
    medio_transporte = perfil.medio_transporte if perfil else "Transporte público"
    modalidad_preferida = perfil.modalidad_preferida if perfil else "Presencial"

    # 3. Recomendar carreras (filtrar pertinencia -> ordenar por cercanía / modalidad / subenfoque)
    carreras_sugeridas = []
    if not todas_cero:
        carreras_sugeridas = recomendar_carreras(
            puntuaciones_areas=puntuaciones,
            provincia_origen=provincia,
            ciudad_origen=ciudad,
            medio_transporte=medio_transporte,
            modalidad_preferida=modalidad_preferida,
            respuestas=datos.respuestas,
            db=db,
        )

    # 4. Generar recomendaciones pedagógicas
    afinidad_top = calculo.get("max_afinidad", 0)
    recomendaciones = generar_recomendaciones_pedagogicas(
        area_top=area_predominante,
        afinidad_top=afinidad_top,
        es_empate=es_empate,
        areas_empatadas=areas_empatadas,
    )

    # 5. Persistir en la base de datos (cada intento es un registro nuevo en el historial)
    nueva_evaluacion = Evaluacion(
        usuario_id=usuario_actual.id,
        version_cuestionario=version_cuestionario,
        respuestas_json=datos.respuestas,
        puntuaciones_areas=puntuaciones,
        area_predominante=area_predominante,
        areas_empatadas=areas_empatadas,
        es_empate=es_empate,
        carreras_sugeridas=carreras_sugeridas[:12],
    )
    db.add(nueva_evaluacion)
    db.commit()
    db.refresh(nueva_evaluacion)

    return {
        "id": nueva_evaluacion.id,
        "usuario_id": usuario_actual.id,
        "creado_en": nueva_evaluacion.creado_en.isoformat(),
        "area_predominante": area_predominante,
        "puntuaciones_areas": puntuaciones,
        "es_empate": es_empate,
        "areas_empatadas": areas_empatadas,
        "todas_cero": todas_cero,
        "mensaje_resultado": mensaje_resultado,
        "version_cuestionario": version_cuestionario,
        "max_puntos_por_area": max_puntos_por_area,
        "carreras_sugeridas": carreras_sugeridas[:12],
        "recomendaciones": recomendaciones,
        "provincia_origen": provincia,
        "ciudad_origen": ciudad,
    }


@router.get("/ultima", summary="Obtener la última evaluación realizada por el estudiante autenticado")
def obtener_ultima_evaluacion(
    usuario_actual: Usuario = Depends(require_estudiante),
    db: Session = Depends(get_db)
):
    """
    Retorna la evaluación más reciente del estudiante para persistir sus resultados
    al iniciar sesión o recargar.
    Aislamiento estricto: solo accede a datos del usuario autenticado.
    """
    evaluacion = (
        db.query(Evaluacion)
        .filter(Evaluacion.usuario_id == usuario_actual.id)
        .order_by(Evaluacion.creado_en.desc())
        .first()
    )
    if not evaluacion:
        return None

    perfil = db.query(Perfil).filter(Perfil.usuario_id == usuario_actual.id).first()
    provincia = perfil.provincia if perfil else "Pichincha"
    ciudad = perfil.ciudad if perfil else "Quito"
    afinidad_top = evaluacion.puntuaciones_areas.get(evaluacion.area_predominante, 80) if isinstance(evaluacion.puntuaciones_areas, dict) else 80

    version_q = getattr(evaluacion, "version_cuestionario", "2.0-10areas")
    max_pts = 8 if version_q == "3.0-20preguntas" else 12

    return {
        "id": evaluacion.id,
        "usuario_id": evaluacion.usuario_id,
        "creado_en": evaluacion.creado_en.isoformat(),
        "area_predominante": evaluacion.area_predominante,
        "puntuaciones_areas": evaluacion.puntuaciones_areas,
        "carreras_sugeridas": evaluacion.carreras_sugeridas,
        "recomendaciones": generar_recomendaciones_pedagogicas(
            evaluacion.area_predominante,
            afinidad_top,
            es_empate=getattr(evaluacion, "es_empate", False),
            areas_empatadas=getattr(evaluacion, "areas_empatadas", []),
        ),
        "provincia_origen": provincia,
        "ciudad_origen": ciudad,
        "es_empate": getattr(evaluacion, "es_empate", False),
        "areas_empatadas": getattr(evaluacion, "areas_empatadas", []),
        "version_cuestionario": version_q,
        "max_puntos_por_area": max_pts,
    }


@router.get("/", summary="Obtener historial de evaluaciones del estudiante autenticado")
def obtener_historial_evaluaciones(
    usuario_actual: Usuario = Depends(require_estudiante),
    db: Session = Depends(get_db)
):
    """
    Retorna todos los intentos de test completados por el estudiante en orden cronológico descendente.
    Cada usuario solo puede acceder a sus propios registros.
    """
    evaluaciones = (
        db.query(Evaluacion)
        .filter(Evaluacion.usuario_id == usuario_actual.id)
        .order_by(Evaluacion.creado_en.desc())
        .all()
    )

    historial = []
    for e in evaluaciones:
        top_carrera = e.carreras_sugeridas[0] if e.carreras_sugeridas else None
        ver_q = getattr(e, "version_cuestionario", "2.0-10areas")
        max_pts = 8 if ver_q == "3.0-20preguntas" else 12
        historial.append({
            "id": e.id,
            "creado_en": e.creado_en.isoformat(),
            "area_predominante": e.area_predominante,
            "puntuaciones_areas": e.puntuaciones_areas,
            "carrera_top": top_carrera,
            "total_carreras": len(e.carreras_sugeridas) if e.carreras_sugeridas else 0,
            "es_empate": getattr(e, "es_empate", False),
            "areas_empatadas": getattr(e, "areas_empatadas", []),
            "version_cuestionario": ver_q,
            "max_puntos_por_area": max_pts,
        })

    return historial


@router.get("/{evaluacion_id}", summary="Consultar detalle de una evaluación por ID")
def obtener_detalle_evaluacion(
    evaluacion_id: int,
    usuario_actual: Usuario = Depends(require_estudiante),
    db: Session = Depends(get_db)
):
    """
    Permite visualizar los resultados de una evaluación guardada en el historial.
    Aislamiento estricto: rechaza si pertenece a otro estudiante.
    """
    evaluacion = (
        db.query(Evaluacion)
        .filter(Evaluacion.id == evaluacion_id, Evaluacion.usuario_id == usuario_actual.id)
        .first()
    )

    if not evaluacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluación no encontrada o no autorizada para su cuenta."
        )

    perfil = db.query(Perfil).filter(Perfil.usuario_id == usuario_actual.id).first()
    provincia = perfil.provincia if perfil else "Pichincha"
    ciudad = perfil.ciudad if perfil else "Quito"
    afinidad_top = evaluacion.puntuaciones_areas.get(evaluacion.area_predominante, 80) if isinstance(evaluacion.puntuaciones_areas, dict) else 80
    ver_q = getattr(evaluacion, "version_cuestionario", "2.0-10areas")
    max_pts = 8 if ver_q == "3.0-20preguntas" else 12

    return {
        "id": evaluacion.id,
        "usuario_id": evaluacion.usuario_id,
        "creado_en": evaluacion.creado_en.isoformat(),
        "area_predominante": evaluacion.area_predominante,
        "puntuaciones_areas": evaluacion.puntuaciones_areas,
        "carreras_sugeridas": evaluacion.carreras_sugeridas,
        "recomendaciones": generar_recomendaciones_pedagogicas(
            evaluacion.area_predominante,
            afinidad_top,
            es_empate=getattr(evaluacion, "es_empate", False),
            areas_empatadas=getattr(evaluacion, "areas_empatadas", []),
        ),
        "provincia_origen": provincia,
        "ciudad_origen": ciudad,
        "es_empate": getattr(evaluacion, "es_empate", False),
        "areas_empatadas": getattr(evaluacion, "areas_empatadas", []),
        "version_cuestionario": ver_q,
        "max_puntos_por_area": max_pts,
    }
