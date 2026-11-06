import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from fastapi import HTTPException, status
from app.core.config import settings


def enviar_informe_por_correo(
    destinatario_email: str,
    nombre_estudiante: str,
    pdf_bytes: bytes,
    evaluacion_id: int,
    area_predominante: str = "Intereses Vocacionales",
) -> dict:
    """
    Envía el informe en formato PDF como archivo adjunto (Informe_vocacional_Nexora.pdf)
    a la dirección de correo registrada del estudiante, utilizando el servidor SMTP configurado
    mediante variables de entorno en backend/.env.
    """
    # 1. Validar que las credenciales SMTP estén configuradas en el entorno
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "El servicio de envío de correos SMTP no está configurado en el servidor. "
                "Para habilitar el envío real de correos, configure las variables SMTP_HOST, "
                "SMTP_PORT, SMTP_USER y SMTP_PASSWORD en el archivo backend/.env."
            ),
        )

    remitente_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
    remitente_display = f"{settings.SMTP_FROM_NAME} <{remitente_email}>"

    # 2. Construir el mensaje MIME
    msg = MIMEMultipart("mixed")
    msg["From"] = remitente_display
    msg["To"] = destinatario_email
    msg["Subject"] = f"Tu Informe Vocacional Oficial - Nexora ({nombre_estudiante})"

    # Parte de texto alternativo (Plain text + HTML)
    msg_alt = MIMEMultipart("alternative")

    texto_plano = f"""Hola, {nombre_estudiante}:

Adjunto a este mensaje encontrarás tu informe vocacional oficial emitido por Nexora en formato PDF (Informe_vocacional_Nexora.pdf), correspondiente a tu evaluación #{evaluacion_id}.

Resumen de tu evaluación:
- Área vocacional predominante: {area_predominante}
- Documento adjunto: Informe_vocacional_Nexora.pdf

Este informe contiene tu índice de interés declarado en las 10 áreas del conocimiento, junto con las carreras universitarias públicas recomendadas conforme a tus intereses y cercanía geográfica.

Atentamente,
Equipo Nexora
Sistema de Orientación Vocacional y Consulta de Universidades Públicas del Ecuador
"""

    texto_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe Vocacional Nexora</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F7F7FC; margin: 0; padding: 24px; color: #252238;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(56, 32, 100, 0.08); border: 1px solid #E2E8F0;">
    <!-- Encabezado con degradado morado Nexora -->
    <tr>
      <td style="background: linear-gradient(135deg, #7C3AED 0%, #382064 100%); padding: 32px 30px; text-align: center;">
        <h1 style="color: #FFFFFF; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">NEXORA</h1>
        <p style="color: #EDE9FE; margin: 6px 0 0 0; font-size: 13px;">Sistema de Orientación Vocacional y Consulta de Universidades Públicas del Ecuador</p>
      </td>
    </tr>
    <!-- Contenido principal -->
    <tr>
      <td style="padding: 32px 30px;">
        <h2 style="color: #382064; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">¡Hola, {nombre_estudiante}!</h2>
        
        <p style="font-size: 15px; line-height: 1.6; color: #4B5563; margin-bottom: 20px;">
          Adjunto a este correo encontrarás tu <strong>Informe Vocacional Oficial</strong> en formato PDF (<code>Informe_vocacional_Nexora.pdf</code>) con los resultados de tu evaluación académica.
        </p>

        <!-- Tarjeta de resumen de evaluación -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F3EEFB; border: 1px solid #DDD6FE; border-radius: 12px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 18px 20px;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #7C3AED; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Evaluación #{evaluacion_id}</p>
              <p style="margin: 0; font-size: 16px; color: #382064; font-weight: 800;">
                Área de mayor interés: {area_predominante}
              </p>
            </td>
          </tr>
        </table>

        <p style="font-size: 14px; line-height: 1.6; color: #4B5563; margin-bottom: 24px;">
          En el documento adjunto podrás consultar:
        </p>
        <ul style="font-size: 14px; line-height: 1.7; color: #4B5563; margin-bottom: 24px; padding-left: 20px;">
          <li>Tu puntuación en cada una de las 10 áreas vocacionales.</li>
          <li>Ofertas pertinentes en universidades y escuelas politécnicas públicas.</li>
          <li>Distancias referenciales y estimaciones de traslado desde tu ciudad de origen.</li>
          <li>Recomendaciones pedagógicas para tu toma de decisión profesional.</li>
        </ul>

        <p style="font-size: 13px; color: #6B7280; font-style: italic; border-left: 3px solid #7C3AED; padding-left: 12px; margin-bottom: 24px;">
          Aclaración metodológica: Este informe corresponde a un índice de interés vocacional reflexivo y no constituye una medida estandarizada de aptitud ni una asignación de cupos de admisión.
        </p>

        <p style="font-size: 14px; color: #382064; margin-bottom: 0;">
          Éxitos en tu proceso de elección vocacional,<br>
          <strong>Equipo Nexora</strong>
        </p>
      </td>
    </tr>
    <!-- Pie institucional -->
    <tr>
      <td style="background-color: #F8FAFC; padding: 18px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
        <p style="margin: 0; font-size: 12px; color: #94A3B8;">
          Nexora • Orientación Vocacional Universitaria • Ecuador 2026<br>
          Este correo fue generado automáticamente para la cuenta asociada a {destinatario_email}.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    msg_alt.attach(MIMEText(texto_plano, "plain", "utf-8"))
    msg_alt.attach(MIMEText(texto_html, "html", "utf-8"))
    msg.attach(msg_alt)

    # 3. Adjuntar el informe PDF con el nombre oficial exacto solicitado
    archivo_adjunto = MIMEApplication(pdf_bytes, _subtype="pdf")
    archivo_adjunto.add_header(
        "Content-Disposition",
        "attachment",
        filename="Informe_vocacional_Nexora.pdf",
    )
    msg.attach(archivo_adjunto)

    # 4. Conexión segura y despacho SMTP
    try:
        if settings.SMTP_USE_SSL:
            # Conexión directa SSL (generalmente puerto 465)
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=25) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(remitente_email, [destinatario_email], msg.as_string())
        else:
            # Conexión estándar con STARTTLS (generalmente puerto 587 o 25)
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=25) as server:
                server.ehlo()
                if settings.SMTP_USE_TLS:
                    server.starttls()
                    server.ehlo()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(remitente_email, [destinatario_email], msg.as_string())

        return {
            "ok": True,
            "simulado": False,
            "email": destinatario_email,
            "mensaje": f"El informe PDF ha sido enviado exitosamente a tu correo registrado ({destinatario_email}).",
            "evaluacion_id": evaluacion_id,
            "archivo_adjunto": "Informe_vocacional_Nexora.pdf",
        }

    except smtplib.SMTPAuthenticationError as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=(
                "Error de autenticación SMTP: Las credenciales del remitente configuradas en backend/.env fueron rechazadas. "
                "Si utiliza Gmail, recuerde generar una Contraseña de Aplicación de 16 caracteres en lugar de su clave habitual."
            ),
        )
    except smtplib.SMTPConnectError as err:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"No se pudo conectar al servidor SMTP ({settings.SMTP_HOST}:{settings.SMTP_PORT}). Verifique host y puerto.",
        )
    except smtplib.SMTPRecipientsRefused as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El servidor SMTP rechazó la dirección de correo destinataria ({destinatario_email}).",
        )
    except (TimeoutError, OSError) as err:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"Tiempo de espera agotado al conectar con el servidor SMTP ({settings.SMTP_HOST}:{settings.SMTP_PORT}): {str(err)}",
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Error inesperado al despachar el correo a través del servidor SMTP: {str(err)}",
        )
