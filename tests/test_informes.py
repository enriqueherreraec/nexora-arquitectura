import os
from fastapi.testclient import TestClient


def test_enviar_informe_propio_exitoso(client: TestClient, headers_estudiante_a: dict):
    """
    Verifica el despacho exitoso del informe PDF propio generado con ReportLab (HU-04, CA-04.1).
    Debe retornar 200 OK y confirmar el destinatario.
    """
    response = client.post(
        "/api/v1/informes/101/enviar-correo",
        headers=headers_estudiante_a
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["destinatario"] == "estudiante.demo@ejemplo.edu.ec"
    assert data["evaluacion_id"] == 101
    assert data["archivo_adjunto"] == "Informe_vocacional_Nexora.pdf"


def test_rechazo_informe_ajeno_ca042(client: TestClient, headers_estudiante_a: dict):
    """
    Verifica el control de propiedad y rechazo de recursos ajenos (HU-04, CA-04.2, ADR-001):
    El Estudiante A (titular de la evaluación 101) intenta solicitar el informe
    de la evaluación 202 (perteneciente al Estudiante B).
    Debe producirse 100 rechazos HTTP 404/403 y 0 informes enviados.
    """
    rechazos = 0
    envios_indebidos = 0

    for _ in range(100):
        # Intento de acceso a recurso ajeno
        response = client.post(
            "/api/v1/informes/202/enviar-correo",
            headers=headers_estudiante_a
        )
        if response.status_code in [403, 404]:
            rechazos += 1
            assert "no autorizada" in response.json()["detail"].lower()
        elif response.status_code == 200:
            envios_indebidos += 1

    assert rechazos == 100, f"Se esperaban 100 rechazos por propiedad, se obtuvieron {rechazos}"
    assert envios_indebidos == 0, f"Fallo crítico de seguridad: se enviaron {envios_indebidos} informes ajenos"


def test_fallo_smtp_controlado_e5(client: TestClient, headers_estudiante_a: dict):
    """
    Verifica el escenario E5 del dossier de arquitectura:
    Ante la indisponibilidad o fallo simulado del servidor SMTP, la API debe
    capturar el error de red y retornar HTTP 503 controlado sin declarar éxito falso,
    mientras las operaciones de autenticación (EP1) y consulta (EP3) continúan operando.
    """
    # Activar simulación de fallo SMTP
    os.environ["SIMULAR_FALLO_SMTP"] = "true"
    try:
        response_envio = client.post(
            "/api/v1/informes/101/enviar-correo",
            headers=headers_estudiante_a
        )
        # La API debe retornar 503 Service Unavailable controlado
        assert response_envio.status_code == 503
        assert "no se encuentra disponible" in response_envio.json()["detail"].lower()

        # Comprobar continuidad de EP1 (Login) durante la caída de correo
        resp_login = client.post(
            "/api/v1/auth/login",
            json={"email": "estudiante.demo@ejemplo.edu.ec", "password": "ClaveSegura2026."}
        )
        assert resp_login.status_code == 200

        # Comprobar continuidad de EP3 (Consulta de última evaluación)
        resp_consulta = client.get(
            "/api/v1/evaluaciones/ultima",
            headers=headers_estudiante_a
        )
        assert resp_consulta.status_code == 200
        assert resp_consulta.json()["id"] == 101

    finally:
        os.environ["SIMULAR_FALLO_SMTP"] = "false"


def test_informe_sin_token_401(client: TestClient):
    """
    Verifica que la solicitud de despacho sin token Bearer sea rechazada con HTTP 401 (CA-04.4).
    """
    response = client.post("/api/v1/informes/101/enviar-correo")
    assert response.status_code == 401


def test_correo_sin_activacion_explicita_no_produce_exito_simulado(client: TestClient, headers_estudiante_a: dict):
    """
    Comprueba que si MODO_PRUEBAS_SIMULACION_CORREO no está activado expresamente,
    la ausencia de credenciales produce un error controlado HTTP 503 y nunca una confirmación falsa de envío.
    """
    os.environ["MODO_PRUEBAS_SIMULACION_CORREO"] = "false"
    try:
        response = client.post(
            "/api/v1/informes/101/enviar-correo",
            headers=headers_estudiante_a
        )
        assert response.status_code == 503
        assert "credenciales smtp no disponibles" in response.json()["detail"].lower()
    finally:
        os.environ["MODO_PRUEBAS_SIMULACION_CORREO"] = "true"


def test_correo_eliminacion_variable_entorno_no_produce_exito_simulado(
    monkeypatch, client: TestClient, headers_estudiante_a: dict
):
    """
    Comprueba que si se elimina MODO_PRUEBAS_SIMULACION_CORREO mediante monkeypatch.delenv,
    el valor predeterminado 'false' entra en acción y la ausencia de credenciales produce un error
    controlado HTTP 503, impidiendo cualquier confirmación falsa de envío.
    """
    monkeypatch.delenv("MODO_PRUEBAS_SIMULACION_CORREO", raising=False)
    response = client.post(
        "/api/v1/informes/101/enviar-correo",
        headers=headers_estudiante_a
    )
    assert response.status_code == 503
    assert "credenciales smtp no disponibles" in response.json()["detail"].lower()
    assert "no se declara confirmación falsa" in response.json()["detail"].lower()


def test_correo_fuera_de_testing_sin_credenciales_produce_error_controlado():
    """
    Comprueba que fuera de testing (ej. production), la función de servicio
    rechace simular éxito y lance SMTPServiceUnavailableException si no hay credenciales SMTP.
    """
    from src.services.email_service import despachar_correo_informe, SMTPServiceUnavailableException
    from src.core.config import settings

    # Simular entorno fuera de testing
    original_env = settings.ENVIRONMENT
    settings.ENVIRONMENT = "production"
    try:
        import pytest
        with pytest.raises(SMTPServiceUnavailableException) as exc_info:
            despachar_correo_informe(
                destinatario="test@ejemplo.edu.ec",
                nombre_estudiante="Test",
                pdf_bytes=b"%PDF-1.4",
                evaluacion_id=101,
                area_predominante="Tecnología"
            )
        assert "credenciales smtp no disponibles" in str(exc_info.value).lower()
        assert "no se declara confirmación falsa" in str(exc_info.value).lower()
    finally:
        settings.ENVIRONMENT = original_env


def test_correo_ninguna_prueba_contacta_smtp_real(monkeypatch, client: TestClient, headers_estudiante_a: dict):
    """
    Comprueba que durante la ejecución de las pruebas nunca se contacta a un servidor SMTP real.
    Si alguna rutina intentara abrir un socket SMTP real, se levantaría un fallo inmediato.
    """
    import smtplib

    def socket_prohibido(*args, **kwargs):
        raise AssertionError("VIOLACIÓN DE AISLAMIENTO: Una prueba intentó conectar con un servidor SMTP real.")

    monkeypatch.setattr(smtplib, "SMTP", socket_prohibido)
    monkeypatch.setattr(smtplib, "SMTP_SSL", socket_prohibido)

    # El despacho en modo de prueba explícito debe resolverse sin tocar smtplib.SMTP
    response = client.post(
        "/api/v1/informes/101/enviar-correo",
        headers=headers_estudiante_a
    )
    assert response.status_code == 200
    assert response.json()["status"] == "success"
