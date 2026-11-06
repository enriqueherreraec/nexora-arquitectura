import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from unittest.mock import patch, MagicMock

from app.main import app
from app.core.config import settings
from app.core.database import Base, get_db

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


def test_catalogo_universidades_y_carreras(client):
    # Probar endpoint universidades
    res_unis = client.get("/api/v1/catalogo/universidades")
    assert res_unis.status_code == 200
    unis = res_unis.json()
    assert len(unis) >= 10
    assert any(u["siglas"] == "UTMACH" for u in unis)

    # Probar endpoint carreras con filtro
    res_carreras = client.get("/api/v1/catalogo/carreras?area=Ingeniería y Tecnología")
    assert res_carreras.status_code == 200
    carreras = res_carreras.json()
    assert len(carreras) >= 5
    for c in carreras:
        assert c["area_vocacional"] in ["Ingeniería y Tecnología", "Ingenierías y Tecnologías"]
        assert c["puntaje_referencial"] is not None
        assert c["nivelacion_estado"] is not None


def test_cuestionario_preguntas(client):
    res = client.get("/api/v1/cuestionario/preguntas")
    assert res.status_code == 200
    data = res.json()
    assert "preguntas" in data
    assert len(data["preguntas"]) >= 15
    assert "opciones" in data
    assert len(data["opciones"]) == 5


def test_evaluacion_flujo_completo_pdf_y_correo(client):
    # 1. Registrar usuario en El Oro (Machala)
    reg_res = client.post("/api/v1/auth/register", json={
        "nombre_completo": "Estudiante Machala",
        "email": "machala@nexora.edu.ec",
        "password": "PasswordSegura123*",
        "provincia": "El Oro",
        "ciudad": "Machala",
        "modalidad_preferida": "Presencial",
        "medio_transporte": "Transporte público"
    })
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Responder cuestionario con alto interés en Software (preguntas 1, 2, 3 = 4)
    respuestas = {str(i): (4 if i in [1, 2, 3] else 1) for i in range(1, 31)}

    eval_res = client.post("/api/v1/evaluaciones/", json={"respuestas": respuestas}, headers=headers)
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    eval_id = eval_data["id"]

    # Verificar que el área predominante sea Ingeniería y Tecnología
    assert eval_data["area_predominante"] == "Ingeniería y Tecnología"
    assert eval_data["puntuaciones_areas"]["Ingeniería y Tecnología"] == 100

    # Verificar recomendación: debe incluir carreras afines y la más cercana en Machala debe estar primero
    sugerencias = eval_data["carreras_sugeridas"]
    assert len(sugerencias) > 0
    primera_carrera = sugerencias[0]
    assert primera_carrera["siglas"] == "UTMACH"
    assert any(k in primera_carrera["nombre"].lower() for k in ["tecnolog", "software", "computac", "sistem", "datos", "inteligencia"])

    # Y también debe incluir alternativas de otras universidades
    otras_unis = [c["siglas"] for c in sugerencias]
    assert "UTMACH" in otras_unis
    assert any(sigla in otras_unis for sigla in ["ESPOL", "UNEMI", "UEB", "UTEQ", "UNL", "UPSE", "UTM"])

    # 3. Probar descarga de PDF
    pdf_res = client.get(f"/api/v1/informes/{eval_id}/pdf", headers=headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000

    # 4. Probar envío de correo real con PDF adjunto usando mock de SMTP
    mock_server = MagicMock()
    mock_smtp_ctx = MagicMock()
    mock_smtp_ctx.__enter__.return_value = mock_server

    with patch.object(settings, "SMTP_HOST", "smtp.test.com"), \
         patch.object(settings, "SMTP_PORT", 587), \
         patch.object(settings, "SMTP_USER", "remitente@nexora.edu.ec"), \
         patch.object(settings, "SMTP_PASSWORD", "secret123"), \
         patch.object(settings, "SMTP_USE_TLS", True), \
         patch("smtplib.SMTP", return_value=mock_smtp_ctx):

        mail_res = client.post(f"/api/v1/informes/{eval_id}/enviar-correo", headers=headers)
        assert mail_res.status_code == 200
        mail_data = mail_res.json()
        assert mail_data["ok"] is True
        assert mail_data["simulado"] is False
        assert mail_data["email"] == "machala@nexora.edu.ec"
        assert mail_data["archivo_adjunto"] == "Informe_vocacional_Nexora.pdf"
        assert "exitosamente" in mail_data["mensaje"].lower()
        assert mock_server.sendmail.called
