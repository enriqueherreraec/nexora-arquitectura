from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.api.v1.dependencies import get_current_user
from src.models.usuario import Usuario
from src.models.evaluacion import Evaluacion
from src.schemas.informe import InformeEnvioResponse
from src.services.pdf_service import generar_pdf_informe_vocacional
from src.services.email_service import despachar_correo_informe, SMTPServiceUnavailableException

router = APIRouter(prefix="/informes", tags=["Informes"])


@router.post(
    "/{id}/enviar-correo",
    response_model=InformeEnvioResponse,
    summary="Despachar informe vocacional en PDF al correo de la cuenta",
    responses={
        401: {"description": "No autenticado"},
        404: {"description": "Evaluación no encontrada o no autorizada (E1)"},
        503: {"description": "Servicio de correo SMTP no disponible (E5)"},
    }
)
def enviar_informe_correo(
    evaluacion_id: int = Path(..., alias="id", ge=1, description="ID de la evaluación a despachar"),
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Despacha el informe oficial en PDF al correo del titular autenticado:
    1. Verifica la propiedad estricta de la evaluación (ADR-001, E1).
    2. Genera el PDF formal en memoria mediante ReportLab.
    3. Despacha el correo vía SMTP con tolerancia a fallos controlada (E5).
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

    provincia = usuario_actual.perfil.provincia if usuario_actual.perfil else "Pichincha"
    ciudad = usuario_actual.perfil.ciudad if usuario_actual.perfil else "Quito"
    modalidad = usuario_actual.perfil.modalidad_preferida if usuario_actual.perfil else "Presencial"

    estudiante_info = {
        "nombre": usuario_actual.nombre_completo,
        "email": usuario_actual.email,
        "provincia": provincia,
        "ciudad": ciudad,
        "modalidad": modalidad,
    }

    evaluacion_info = {
        "area_predominante": evaluacion.area_predominante,
        "puntuaciones_areas": evaluacion.puntuaciones_areas or {},
        "carreras_sugeridas": evaluacion.carreras_sugeridas or [],
        "version_cuestionario": evaluacion.version_cuestionario,
    }

    # 1. Generar PDF en memoria con ReportLab
    pdf_buffer = generar_pdf_informe_vocacional(estudiante_info, evaluacion_info)
    pdf_bytes = pdf_buffer.getvalue()

    # 2. Despachar por correo con manejo de excepción SMTP (E5)
    try:
        resultado = despachar_correo_informe(
            destinatario=usuario_actual.email,
            nombre_estudiante=usuario_actual.nombre_completo,
            pdf_bytes=pdf_bytes,
            evaluacion_id=evaluacion.id,
            area_predominante=evaluacion.area_predominante,
        )
    except SMTPServiceUnavailableException as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc)
        )

    return InformeEnvioResponse(
        status=resultado["status"],
        mensaje=resultado["mensaje"],
        destinatario=resultado["destinatario"],
        evaluacion_id=resultado["evaluacion_id"],
        archivo_adjunto=resultado["archivo_adjunto"],
    )
