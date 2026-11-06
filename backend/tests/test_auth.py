import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app

from app.core.database import Base, get_db
from app.modules.cuentas.models import Usuario
from app.modules.perfiles.models import Perfil

# Base de datos SQLite en memoria para tests aislados y rápidos
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app)


def test_registro_usuario_exitoso(client):
    payload = {
        "nombre_completo": "Estudiante Prueba Ecuador",
        "email": "estudiante@nexora.edu.ec",
        "password": "PasswordSegura123*",
        "provincia": "Pichincha",
        "ciudad": "Quito",
        "modalidad_preferida": "Presencial",
        "medio_transporte": "Transporte público"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["usuario"]["email"] == "estudiante@nexora.edu.ec"
    assert data["usuario"]["nombre_completo"] == "Estudiante Prueba Ecuador"
    assert data["usuario"]["perfil"]["ciudad"] == "Quito"


def test_registro_correo_duplicado(client):
    payload = {
        "nombre_completo": "Estudiante Original",
        "email": "duplicado@nexora.edu.ec",
        "password": "PasswordSegura123*",
        "provincia": "Guayas",
        "ciudad": "Guayaquil"
    }
    # Primer registro
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    # Intento de duplicado
    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "ya se encuentra registrado" in res2.json()["detail"]


def test_registro_contraseña_invalida(client):
    payload = {
        "nombre_completo": "Estudiante Corto",
        "email": "corto@nexora.edu.ec",
        "password": "123",  # Menor a 8 caracteres
        "provincia": "Azuay",
        "ciudad": "Cuenca"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_login_exitoso(client):
    # Registrar usuario
    client.post("/api/v1/auth/register", json={
        "nombre_completo": "Usuario Login",
        "email": "login@nexora.edu.ec",
        "password": "PasswordSegura123*",
        "provincia": "Pichincha",
        "ciudad": "Quito"
    })

    # Iniciar sesión
    login_res = client.post("/api/v1/auth/login", json={
        "email": "login@nexora.edu.ec",
        "password": "PasswordSegura123*"
    })
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["usuario"]["email"] == "login@nexora.edu.ec"


def test_login_contraseña_incorrecta(client):
    # Registrar usuario
    client.post("/api/v1/auth/register", json={
        "nombre_completo": "Usuario Clave Invalida",
        "email": "claveinvalida@nexora.edu.ec",
        "password": "PasswordSegura123*"
    })

    # Intentar con clave errónea
    login_res = client.post("/api/v1/auth/login", json={
        "email": "claveinvalida@nexora.edu.ec",
        "password": "ClaveEquivocada999"
    })
    assert login_res.status_code == 401
    assert "Credenciales incorrectas" in login_res.json()["detail"]


def test_acceso_protegido_sin_sesion(client):
    # Intentar acceder a /me sin Authorization header
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_acceso_protegido_con_token_invalido(client):
    headers = {"Authorization": "Bearer token_falso_invalido_123"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 401


def test_acceso_protegido_con_sesion_valida(client):
    # 1. Registrar
    reg = client.post("/api/v1/auth/register", json={
        "nombre_completo": "Estudiante Protegido",
        "email": "protegido@nexora.edu.ec",
        "password": "PasswordSegura123*",
        "provincia": "Loja",
        "ciudad": "Loja"
    })
    token = reg.json()["access_token"]

    # 2. Consultar /me
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    datos = me_res.json()
    assert datos["email"] == "protegido@nexora.edu.ec"
    assert datos["nombre_completo"] == "Estudiante Protegido"
    assert datos["perfil"]["ciudad"] == "Loja"
