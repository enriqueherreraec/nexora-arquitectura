import os
import pytest
from datetime import timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Forzar entorno de prueba, clave JWT sintética y base aislada
os.environ["ENVIRONMENT"] = "testing"
os.environ["DB_NAME"] = "nexora_test_semana2"
os.environ["SECRET_KEY"] = "nexora_test_synthetic_secret_key_testing_only_2026_xyz"
os.environ["MODO_PRUEBAS_SIMULACION_CORREO"] = "true"

from src.core.config import settings
from src.core.database import engine, Base, SessionLocal
from src.core.security import hash_password, create_access_token
from src.models.usuario import Usuario, Perfil
from src.models.evaluacion import Evaluacion
from src.main import app


def _validar_seguridad_base_de_pruebas():
    """
    Salvaguarda estricta de aislamiento:
    Verifica mediante igualdad exacta que engine.url.database y settings.DB_NAME
    correspondan exclusivamente a 'nexora_test_semana2', y que ENVIRONMENT sea 'testing'.
    Rechaza explícitamente cualquier operación destructiva sobre bases reales o de producción.
    """
    db_name = settings.DB_NAME
    env = settings.ENVIRONMENT
    engine_db = engine.url.database

    if env != "testing":
        raise RuntimeError(
            f"VIOLACIÓN DE AISLAMIENTO: Se intentó manipular la base de datos en entorno no seguro '{env}'. "
            f"Solo se permite la ejecución de pruebas con ENVIRONMENT='testing'."
        )
    if db_name != "nexora_test_semana2":
        raise RuntimeError(
            f"VIOLACIÓN DE AISLAMIENTO: settings.DB_NAME es '{db_name}', no coincide exactamente con 'nexora_test_semana2'."
        )
    if engine_db != "nexora_test_semana2":
        raise RuntimeError(
            f"VIOLACIÓN DE AISLAMIENTO: engine.url.database es '{engine_db}', "
            f"no coincide exactamente con 'nexora_test_semana2'. "
            f"Se aborta drop_all() para salvaguardar los datos originales de Nexora."
        )


@pytest.fixture(scope="session", autouse=True)
def inicializar_base_de_datos_aislada():
    """Crea y resetea las tablas en la base de datos PostgreSQL de prueba aislada."""
    _validar_seguridad_base_de_pruebas()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    # Limpieza final de sesión de pruebas
    _validar_seguridad_base_de_pruebas()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db() -> Session:
    """Fixture de sesión de base de datos con limpieza de datos por función."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="function")
def client() -> TestClient:
    """Cliente HTTP de prueba para interactuar con la aplicación FastAPI."""
    return TestClient(app)


@pytest.fixture(scope="function", autouse=True)
def sembrar_datos_de_prueba(db: Session):
    """
    Siembra usuarios y evaluaciones iniciales controladas en PostgreSQL:
    - Estudiante A (titular, ID 1)
    - Estudiante B (ajeno, ID 2)
    - Estudiante Inactivo (ID 3)
    """
    # Limpiar tablas respetando llaves foráneas
    db.query(Evaluacion).delete()
    db.query(Perfil).delete()
    db.query(Usuario).delete()
    db.commit()

    clave_hasheada = hash_password("ClaveSegura2026.")

    # 1. Estudiante A (Titular)
    est_a = Usuario(
        id=1,
        email="estudiante.demo@ejemplo.edu.ec",
        password_hash=clave_hasheada,
        nombre_completo="Juan Carlos Pérez",
        rol="estudiante",
        activo=True,
    )
    db.add(est_a)
    db.flush()

    perfil_a = Perfil(
        id=1,
        usuario_id=est_a.id,
        provincia="Pichincha",
        ciudad="Quito",
        modalidad_preferida="Presencial",
        medio_transporte="Transporte público",
    )
    db.add(perfil_a)

    # Evaluación histórica para Estudiante A
    eval_a = Evaluacion(
        id=101,
        usuario_id=est_a.id,
        version_cuestionario="3.0-20preguntas",
        respuestas_json={str(i): 3 for i in range(1, 21)},
        puntuaciones_areas={
            "Tecnología e Innovación": 8,
            "Ciencias Exactas": 6,
            "Ciencias de la Salud": 4,
            "Arte y Creatividad": 2,
            "Humanidades y Sociedad": 3,
            "Administración y Negocios": 5,
            "Ciencias Naturales y Agro": 1,
            "Comunicación y Medios": 2,
            "Educación y Pedagogía": 1,
            "Seguridad y Defensa": 2,
        },
        area_predominante="Tecnología e Innovación",
        areas_empatadas=[],
        es_empate=False,
        carreras_sugeridas=[
            {"nombre_carrera": "Ingeniería de Software", "universidad": "EPN", "provincia": "Pichincha", "modalidad": "Presencial", "puntaje_afinidad": 95}
        ],
    )
    db.add(eval_a)

    # 2. Estudiante B (Ajeno)
    est_b = Usuario(
        id=2,
        email="estudiante.ajeno@ejemplo.edu.ec",
        password_hash=clave_hasheada,
        nombre_completo="María Elena Gómez",
        rol="estudiante",
        activo=True,
    )
    db.add(est_b)
    db.flush()

    perfil_b = Perfil(
        id=2,
        usuario_id=est_b.id,
        provincia="Guayas",
        ciudad="Guayaquil",
        modalidad_preferida="Presencial",
        medio_transporte="Particular",
    )
    db.add(perfil_b)

    # Evaluación privada del Estudiante B
    eval_b = Evaluacion(
        id=202,
        usuario_id=est_b.id,
        version_cuestionario="3.0-20preguntas",
        respuestas_json={str(i): 4 for i in range(1, 21)},
        puntuaciones_areas={
            "Tecnología e Innovación": 4,
            "Ciencias de la Salud": 8,
            "Ciencias Exactas": 2,
            "Arte y Creatividad": 1,
            "Humanidades y Sociedad": 2,
            "Administración y Negocios": 3,
            "Ciencias Naturales y Agro": 4,
            "Comunicación y Medios": 1,
            "Educación y Pedagogía": 2,
            "Seguridad y Defensa": 1,
        },
        area_predominante="Ciencias de la Salud",
        areas_empatadas=[],
        es_empate=False,
        carreras_sugeridas=[
            {"nombre_carrera": "Medicina", "universidad": "Universidad de Guayaquil", "provincia": "Guayas", "modalidad": "Presencial", "puntaje_afinidad": 96}
        ],
    )
    db.add(eval_b)

    # 3. Usuario Inactivo
    est_inactivo = Usuario(
        id=3,
        email="inactivo.demo@ejemplo.edu.ec",
        password_hash=clave_hasheada,
        nombre_completo="Usuario Desactivado",
        rol="estudiante",
        activo=False,
    )
    db.add(est_inactivo)

    db.commit()


@pytest.fixture(scope="function")
def headers_estudiante_a() -> dict:
    """Retorna cabecera con token Bearer JWT válido para Estudiante A (titular)."""
    token = create_access_token(
        data={"sub": "estudiante.demo@ejemplo.edu.ec", "uid": 1, "rol": "estudiante"},
        expires_delta=timedelta(hours=2)
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def headers_estudiante_b() -> dict:
    """Retorna cabecera con token Bearer JWT válido para Estudiante B (ajeno)."""
    token = create_access_token(
        data={"sub": "estudiante.ajeno@ejemplo.edu.ec", "uid": 2, "rol": "estudiante"},
        expires_delta=timedelta(hours=2)
    )
    return {"Authorization": f"Bearer {token}"}
