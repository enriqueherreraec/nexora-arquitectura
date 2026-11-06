import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
import smtplib
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.database import SessionLocal
from app.modules.cuentas.models import Usuario
from app.modules.evaluaciones.models import Evaluacion

client = TestClient(app)


def test_envio_correo_requiere_autenticacion():
    """Un intento de envío sin sesión JWT debe ser rechazado con 401."""
    r = client.post("/api/v1/informes/1/enviar-correo")
    assert r.status_code == 401


def test_envio_correo_aislamiento_de_evaluacion():
    """Un estudiante no puede enviar ni acceder a evaluaciones que pertenezcan a otra cuenta."""
    # 1. Crear o loguear usuario A
    email_a = "estudiante_a_email@test.edu.ec"
    r_a = client.post("/api/v1/auth/register", json={
        "email": email_a,
        "password": "Password123.",
        "nombre_completo": "Estudiante A"
    })
    token_a = r_a.json()["access_token"] if r_a.status_code == 201 else client.post(
        "/api/v1/auth/login", json={"email": email_a, "password": "Password123."}
    ).json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Crear o loguear usuario B
    email_b = "estudiante_b_email@test.edu.ec"
    r_b = client.post("/api/v1/auth/register", json={
        "email": email_b,
        "password": "Password123.",
        "nombre_completo": "Estudiante B"
    })
    token_b = r_b.json()["access_token"] if r_b.status_code == 201 else client.post(
        "/api/v1/auth/login", json={"email": email_b, "password": "Password123."}
    ).json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Usuario A genera una evaluación de 20 preguntas
    resp_20 = {str(i): 3 for i in range(1, 21)}
    r_eval = client.post("/api/v1/evaluaciones/", headers=headers_a, json={"respuestas": resp_20})
    assert r_eval.status_code == 200
    eval_id_a = r_eval.json()["id"]

    # 4. Usuario B intenta enviar el correo de la evaluación de Usuario A -> Rechazado con 404
    r_cross = client.post(f"/api/v1/informes/{eval_id_a}/enviar-correo", headers=headers_b)
    assert r_cross.status_code == 404
    assert "no autorizada" in r_cross.json()["detail"].lower()


def test_envio_correo_sin_credenciales_smtp_devuelve_503():
    """Si no están configuradas las credenciales SMTP en backend/.env, devuelve 503 con mensaje explicativo."""
    email = "estudiante_smtp_test@test.edu.ec"
    r_reg = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123.",
        "nombre_completo": "Estudiante SMTP Test"
    })
    token = r_reg.json()["access_token"] if r_reg.status_code == 201 else client.post(
        "/api/v1/auth/login", json={"email": email, "password": "Password123."}
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp_20 = {str(i): 2 for i in range(1, 21)}
    r_eval = client.post("/api/v1/evaluaciones/", headers=headers, json={"respuestas": resp_20})
    assert r_eval.status_code == 200
    eval_id = r_eval.json()["id"]

    # Forzar credenciales vacías para probar la validación
    with patch.object(settings, "SMTP_USER", ""), patch.object(settings, "SMTP_PASSWORD", ""):
        r_send = client.post(f"/api/v1/informes/{eval_id}/enviar-correo", headers=headers)
        assert r_send.status_code == 503
        assert "no está configurado" in r_send.json()["detail"].lower()
        assert "backend/.env" in r_send.json()["detail"]


def test_envio_correo_smtp_exitoso_con_pdf_adjunto():
    """
    Simula una conexión SMTP exitosa y comprueba:
    1. Se obtiene el correo del usuario registrado desde el backend.
    2. Se genera y adjunta Informe_vocacional_Nexora.pdf.
    3. El asunto y cuerpo contienen el nombre del estudiante.
    4. La confirmación es real (no simulada).
    """
    email = "estudiante_exito_smtp@test.edu.ec"
    nombre = "Estudiante Nexora Exitoso"
    r_reg = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123.",
        "nombre_completo": nombre
    })
    token = r_reg.json()["access_token"] if r_reg.status_code == 201 else client.post(
        "/api/v1/auth/login", json={"email": email, "password": "Password123."}
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp_20 = {str(i): 4 if i in [1, 2] else 1 for i in range(1, 21)}
    r_eval = client.post("/api/v1/evaluaciones/", headers=headers, json={"respuestas": resp_20})
    assert r_eval.status_code == 200
    eval_id = r_eval.json()["id"]

    # Mock del servidor SMTP
    mock_server = MagicMock()
    mock_smtp_ctx = MagicMock()
    mock_smtp_ctx.__enter__.return_value = mock_server

    with patch.object(settings, "SMTP_HOST", "smtp.test.com"), \
         patch.object(settings, "SMTP_PORT", 587), \
         patch.object(settings, "SMTP_USER", "remitente@nexora.edu.ec"), \
         patch.object(settings, "SMTP_FROM_EMAIL", "remitente@nexora.edu.ec"), \
         patch.object(settings, "SMTP_PASSWORD", "secret123"), \
         patch.object(settings, "SMTP_USE_TLS", True), \
         patch("smtplib.SMTP", return_value=mock_smtp_ctx):

        r_send = client.post(f"/api/v1/informes/{eval_id}/enviar-correo", headers=headers)
        assert r_send.status_code == 200
        data = r_send.json()

        assert data["ok"] is True
        assert data["simulado"] is False
        assert data["email"] == email
        assert data["archivo_adjunto"] == "Informe_vocacional_Nexora.pdf"
        assert "exitosamente" in data["mensaje"].lower()

        # Comprobar llamadas a smtplib
        mock_server.starttls.assert_called_once()
        mock_server.login.assert_called_once_with("remitente@nexora.edu.ec", "secret123")
        assert mock_server.sendmail.called
        call_args = mock_server.sendmail.call_args[0]
        remitente_usado, destinatarios_usados, mensaje_raw = call_args

        assert remitente_usado == "remitente@nexora.edu.ec"
        assert destinatarios_usados == [email]
        assert "Informe_vocacional_Nexora.pdf" in mensaje_raw
        assert nombre in mensaje_raw


def test_envio_correo_error_autenticacion_smtp():
    """Si el servidor SMTP rechaza las credenciales, devuelve un error claro 502."""
    email = "estudiante_auth_err@test.edu.ec"
    r_reg = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123.",
        "nombre_completo": "Estudiante Auth Err"
    })
    token = r_reg.json()["access_token"] if r_reg.status_code == 201 else client.post(
        "/api/v1/auth/login", json={"email": email, "password": "Password123."}
    ).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp_20 = {str(i): 2 for i in range(1, 21)}
    r_eval = client.post("/api/v1/evaluaciones/", headers=headers, json={"respuestas": resp_20})
    eval_id = r_eval.json()["id"]

    mock_server = MagicMock()
    mock_server.login.side_effect = smtplib.SMTPAuthenticationError(535, b"5.7.8 Username and Password not accepted")
    mock_smtp_ctx = MagicMock()
    mock_smtp_ctx.__enter__.return_value = mock_server

    with patch.object(settings, "SMTP_HOST", "smtp.test.com"), \
         patch.object(settings, "SMTP_USER", "bad_user@nexora.edu.ec"), \
         patch.object(settings, "SMTP_PASSWORD", "bad_pass"), \
         patch("smtplib.SMTP", return_value=mock_smtp_ctx):

        r_send = client.post(f"/api/v1/informes/{eval_id}/enviar-correo", headers=headers)
        assert r_send.status_code == 502
        assert "autenticación smtp" in r_send.json()["detail"].lower()
