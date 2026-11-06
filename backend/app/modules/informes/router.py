from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.cuentas.dependencies import require_estudiante
from app.modules.cuentas.models import Usuario
from app.modules.perfiles.models import Perfil
from app.modules.evaluaciones.models import Evaluacion
from app.modules.evaluaciones.service import generar_recomendaciones_pedagogicas
from app.modules.informes.pdf_generator import generar_pdf_informe_vocacional

router = APIRouter(prefix="/informes", tags=["Informes Vocacionales y Envíos"])


@router.get("/{evaluacion_id}/pdf", summary="Descargar informe vocacional en formato PDF")
def descargar_informe_pdf(
    evaluacion_id: int,
    usuario_actual: Usuario = Depends(require_estudiante),
    db: Session = Depends(get_db)
):
    """
    Genera y descarga en tiempo real el informe formal en PDF usando ReportLab.
    Aislamiento de acceso: Solo el propietario de la evaluación puede descargar su informe.
    """
    evaluacion = (
        db.query(Evaluacion)
        .filter(Evaluacion.id == evaluacion_id, Evaluacion.usuario_id == usuario_actual.id)
        .first()
    )
    if not evaluacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluación no encontrada o no autorizada."
        )

    perfil = db.query(Perfil).filter(Perfil.usuario_id == usuario_actual.id).first()

    estudiante_info = {
        "nombre": usuario_actual.nombre_completo,
        "email": usuario_actual.email,
        "provincia": perfil.provincia if perfil else "Pichincha",
        "ciudad": perfil.ciudad if perfil else "Quito",
        "modalidad": perfil.modalidad_preferida if perfil else "Presencial",
        "transporte": perfil.medio_transporte if perfil else "Transporte público",
    }

    puntuaciones = evaluacion.puntuaciones_areas or {}
    afinidad_top = puntuaciones.get(evaluacion.area_predominante, 80)
    todas_cero = all((v or 0) == 0 for v in puntuaciones.values()) if puntuaciones else False

    evaluacion_info = {
        "area_predominante": evaluacion.area_predominante,
        "puntuaciones_areas": puntuaciones,
        "carreras_sugeridas": evaluacion.carreras_sugeridas or [],
        "es_empate": bool(evaluacion.es_empate),
        "areas_empatadas": evaluacion.areas_empatadas or [],
        "todas_cero": todas_cero,
        "version_cuestionario": getattr(evaluacion, "version_cuestionario", "3.0-20preguntas"),
        "recomendaciones": generar_recomendaciones_pedagogicas(evaluacion.area_predominante, afinidad_top),
    }

    pdf_stream = generar_pdf_informe_vocacional(estudiante_info, evaluacion_info)

    filename = f"nexora_informe_vocacional_{evaluacion_id}.pdf"
    return StreamingResponse(
        pdf_stream,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition",
        }
    )


from app.modules.informes.email_service import enviar_informe_por_correo


@router.post("/{evaluacion_id}/enviar-correo", summary="Despachar informe vocacional al correo de la cuenta")
def enviar_informe_correo(
    evaluacion_id: int,
    usuario_actual: Usuario = Depends(require_estudiante),
    db: Session = Depends(get_db)
):
    """
    Despacha el informe vocacional en formato PDF al correo registrado del estudiante.
    1. Identifica al usuario mediante su token JWT.
    2. Obtiene la dirección registrada de su cuenta y verifica que la evaluación le pertenezca.
    3. Genera en memoria el informe PDF mediante ReportLab.
    4. Envía el correo mediante el servicio SMTP configurado con el archivo Informe_vocacional_Nexora.pdf adjunto.
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

    estudiante_info = {
        "nombre": usuario_actual.nombre_completo,
        "email": usuario_actual.email,
        "provincia": perfil.provincia if perfil else "Pichincha",
        "ciudad": perfil.ciudad if perfil else "Quito",
        "modalidad": perfil.modalidad_preferida if perfil else "Presencial",
        "transporte": perfil.medio_transporte if perfil else "Transporte público",
    }

    puntuaciones = evaluacion.puntuaciones_areas or {}
    afinidad_top = puntuaciones.get(evaluacion.area_predominante, 80)
    todas_cero = all((v or 0) == 0 for v in puntuaciones.values()) if puntuaciones else False

    evaluacion_info = {
        "area_predominante": evaluacion.area_predominante,
        "puntuaciones_areas": puntuaciones,
        "carreras_sugeridas": evaluacion.carreras_sugeridas or [],
        "es_empate": bool(evaluacion.es_empate),
        "areas_empatadas": evaluacion.areas_empatadas or [],
        "todas_cero": todas_cero,
        "version_cuestionario": getattr(evaluacion, "version_cuestionario", "3.0-20preguntas"),
        "recomendaciones": generar_recomendaciones_pedagogicas(evaluacion.area_predominante, afinidad_top),
    }

    # Generar informe PDF oficial con ReportLab
    pdf_stream = generar_pdf_informe_vocacional(estudiante_info, evaluacion_info)
    pdf_bytes = pdf_stream.getvalue()

    # Despachar correo mediante servicio SMTP con Informe_vocacional_Nexora.pdf adjunto
    resultado_envio = enviar_informe_por_correo(
        destinatario_email=usuario_actual.email,
        nombre_estudiante=usuario_actual.nombre_completo,
        pdf_bytes=pdf_bytes,
        evaluacion_id=evaluacion.id,
        area_predominante=evaluacion.area_predominante,
    )

    return resultado_envio
