import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email import encoders
from typing import Dict, Any
from src.core.config import settings


class SMTPServiceUnavailableException(Exception):
    """Excepción controlada cuando el servidor SMTP no está disponible o falla."""
    pass


def despachar_correo_informe(
    destinatario: str,
    nombre_estudiante: str,
    pdf_bytes: bytes,
    evaluacion_id: int,
    area_predominante: str,
    simular_fallo: bool = False,
) -> Dict[str, Any]:
    """
    Despacha el correo con el informe vocacional PDF adjunto.
    Si se detecta indisponibilidad del servicio SMTP o 'simular_fallo' es True,
    lanza SMTPServiceUnavailableException para retornar código HTTP 503 controlado (E5).
    """
    # 1. Inyección de fallo explícita para validación de resiliencia E5
    if simular_fallo or os.getenv("SIMULAR_FALLO_SMTP", "false").lower() == "true":
        raise SMTPServiceUnavailableException(
            "El servicio de envío de correos no se encuentra disponible temporalmente. Intente más tarde."
        )

    # 2. Simulación de éxito EXCLUSIVA en modo de pruebas automatizadas explícito
    if settings.ENVIRONMENT == "testing" and os.getenv("MODO_PRUEBAS_SIMULACION_CORREO", "false").lower() == "true":
        return {
            "status": "success",
            "mensaje": f"Informe vocacional enviado exitosamente a {destinatario} (Simulado en entorno de pruebas)",
            "destinatario": destinatario,
            "evaluacion_id": evaluacion_id,
            "archivo_adjunto": "Informe_vocacional_Nexora.pdf",
        }

    # 3. Fuera del modo de pruebas explícito, la ausencia de credenciales produce error controlado
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        raise SMTPServiceUnavailableException(
            "Servicio de correo no configurado: credenciales SMTP no disponibles en el servidor. "
            "No se declara confirmación falsa de envío."
        )

    # 4. Despacho real mediante servidor SMTP configurado
    try:
        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = destinatario
        msg["Subject"] = f"Nexora - Tu Informe de Orientación Vocacional (Resultado: {area_predominante})"

        cuerpo_html = f"""
        <p>Hola <strong>{nombre_estudiante}</strong>,</p>
        <p>Adjunto encontrarás el informe oficial de tu evaluación vocacional realizada en Nexora.</p>
        <p>Área predominante identificada: <strong>{area_predominante}</strong>.</p>
        <p>Saludos cordiales,<br>Equipo Nexora</p>
        """
        msg.attach(MIMEText(cuerpo_html, "html"))

        adjunto = MIMEBase("application", "pdf")
        adjunto.set_payload(pdf_bytes)
        encoders.encode_base64(adjunto)
        adjunto.add_header("Content-Disposition", "attachment", filename="Informe_vocacional_Nexora.pdf")
        msg.attach(adjunto)

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=settings.SMTP_TIMEOUT_SECONDS)
        server.ehlo()
        if settings.SMTP_PORT == 587:
            server.starttls()
            server.ehlo()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, [destinatario], msg.as_string())
        server.quit()

        return {
            "status": "success",
            "mensaje": f"Informe vocacional enviado exitosamente a {destinatario}",
            "destinatario": destinatario,
            "evaluacion_id": evaluacion_id,
            "archivo_adjunto": "Informe_vocacional_Nexora.pdf",
        }
    except Exception as exc:
        raise SMTPServiceUnavailableException(
            f"El servicio de envío de correos no se encuentra disponible temporalmente: {str(exc)}"
        )
