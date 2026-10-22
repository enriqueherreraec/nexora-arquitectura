from fastapi.testclient import TestClient


def test_login_exitoso(client: TestClient):
    """
    Verifica el inicio de sesión exitoso con credenciales válidas (HU-01, CA-01.1).
    Debe retornar 200 OK con access_token JWT y datos de perfil.
    """
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "estudiante.demo@ejemplo.edu.ec",
            "password": "ClaveSegura2026."
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in_seconds"] == 7200
    assert data["usuario"]["email"] == "estudiante.demo@ejemplo.edu.ec"
    assert data["usuario"]["rol"] == "estudiante"
    assert data["usuario"]["perfil"]["provincia"] == "Pichincha"


def test_login_credenciales_invalidas_ca012(client: TestClient):
    """
    Verifica el rechazo estricto de credenciales inválidas (HU-01, CA-01.2):
    100 intentos de autenticación con credenciales erróneas deben producir
    100 respuestas HTTP 401 y exactamente 0 tokens de acceso emitidos.
    """
    rechazos = 0
    tokens_emitidos = 0

    for i in range(100):
        clave_erronea = f"ClaveInvalida_{i}!"
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "estudiante.demo@ejemplo.edu.ec",
                "password": clave_erronea
            }
        )
        if response.status_code == 401:
            rechazos += 1
            body = response.json()
            assert "Credenciales incorrectas" in body["detail"]
            if "access_token" in body:
                tokens_emitidos += 1

    assert rechazos == 100, f"Se esperaban 100 rechazos HTTP 401, se obtuvieron {rechazos}"
    assert tokens_emitidos == 0, f"Se esperaban 0 tokens emitidos, se detectaron {tokens_emitidos}"


def test_login_cuenta_inactiva(client: TestClient):
    """
    Verifica que no se permita iniciar sesión a cuentas desactivadas (CA-01.3).
    Debe retornar HTTP 403 Forbidden.
    """
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "inactivo.demo@ejemplo.edu.ec",
            "password": "ClaveSegura2026."
        }
    )
    assert response.status_code == 403
    assert "inactiva" in response.json()["detail"].lower()


def test_login_campos_faltantes_422(client: TestClient):
    """
    Verifica la validación sintáctica de esquemas Pydantic cuando faltan campos requeridos (CA-01.4).
    Debe retornar HTTP 422 Unprocessable Entity.
    """
    # Sin contraseña
    resp1 = client.post(
        "/api/v1/auth/login",
        json={"email": "estudiante.demo@ejemplo.edu.ec"}
    )
    assert resp1.status_code == 422

    # Formato de email inválido
    resp2 = client.post(
        "/api/v1/auth/login",
        json={"email": "correo-no-valido", "password": "ClaveSegura2026."}
    )
    assert resp2.status_code == 422


def test_carga_explicita_archivo_env(tmp_path, monkeypatch):
    """
    Verifica que la función _load_env_file cargue explícitamente variables
    desde un archivo .env si existe, sin sobreescribir variables ya presentes.
    """
    import os
    from src.core.config import _load_env_file

    env_file = tmp_path / ".env.test"
    env_file.write_text("TEST_VAR_NEXORA=valor_desde_env\n# comentario\nEXISTING_VAR=nuevo_valor\n", encoding="utf-8")

    monkeypatch.setenv("EXISTING_VAR", "valor_previo")
    monkeypatch.delenv("TEST_VAR_NEXORA", raising=False)

    _load_env_file(str(env_file))

    assert os.getenv("TEST_VAR_NEXORA") == "valor_desde_env"
    assert os.getenv("EXISTING_VAR") == "valor_previo"
