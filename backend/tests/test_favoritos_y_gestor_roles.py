import sys
import random
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.modules.cuentas.models import Usuario
from app.modules.catalogo.models import CarreraCatalogo
from app.modules.favoritos.models import Favorito

client = TestClient(app)


def test_registro_publico_fuerza_rol_estudiante():
    """El registro público debe forzar siempre el rol estudiante e ignorar cualquier intento de escalada."""
    sufijo = random.randint(100000, 999999)
    resp = client.post("/api/v1/auth/register", json={
        "nombre_completo": "Aspirante Universidad",
        "email": f"aspirante_{sufijo}@nexora.edu.ec",
        "password": "PasswordSeguro2026!",
        "rol": "admin"  # Intento de escalada
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["usuario"]["rol"] == "estudiante", "El registro público debe ser siempre estudiante"


def test_favoritos_estudiante_flujo_completo_y_aislamiento():
    """Verifica guardado, consulta, prevención de duplicados, eliminación y aislamiento entre estudiantes."""
    # 1. Crear Estudiante 1
    s1 = random.randint(100000, 999999)
    r1 = client.post("/api/v1/auth/register", json={
        "nombre_completo": "Estudiante Uno",
        "email": f"estudiante1_{s1}@nexora.edu.ec",
        "password": "Password123!",
    })
    token1 = r1.json()["access_token"]
    h1 = {"Authorization": f"Bearer {token1}"}

    # 2. Crear Estudiante 2
    s2 = random.randint(100000, 999999)
    r2 = client.post("/api/v1/auth/register", json={
        "nombre_completo": "Estudiante Dos",
        "email": f"estudiante2_{s2}@nexora.edu.ec",
        "password": "Password123!",
    })
    token2 = r2.json()["access_token"]
    h2 = {"Authorization": f"Bearer {token2}"}

    # Obtener 2 carreras para pruebas
    carreras = client.get("/api/v1/catalogo/carreras?limit=2").json()
    carr1_id = carreras[0]["id"]
    carr2_id = carreras[1]["id"]

    # Estudiante 1 guarda carrera 1 en favoritos
    fav_post = client.post(f"/api/v1/favoritos/{carr1_id}", headers=h1)
    assert fav_post.status_code == 201
    assert fav_post.json()["favorito"] is True

    # Estudiante 1 intenta agregar duplicado -> debe ser idempotente
    fav_dup = client.post(f"/api/v1/favoritos/{carr1_id}", headers=h1)
    assert fav_dup.status_code in (200, 201)

    # Estudiante 1 consulta sus favoritos
    list1 = client.get("/api/v1/favoritos/", headers=h1).json()
    assert len(list1) == 1
    assert list1[0]["carrera_id"] == carr1_id
    assert list1[0]["carrera"]["nombre"] == carreras[0]["nombre"]

    # Consulta rápida de IDs de favoritos
    ids1 = client.get("/api/v1/favoritos/ids", headers=h1).json()
    assert ids1["favoritos_ids"] == [carr1_id]

    # Aislamiento: Estudiante 2 NO debe ver los favoritos del Estudiante 1
    list2 = client.get("/api/v1/favoritos/", headers=h2).json()
    assert len(list2) == 0

    # Estudiante 1 quita la carrera de favoritos
    del_fav = client.delete(f"/api/v1/favoritos/{carr1_id}", headers=h1)
    assert del_fav.status_code == 200
    assert del_fav.json()["favorito"] is False

    list1_after = client.get("/api/v1/favoritos/", headers=h1).json()
    assert len(list1_after) == 0


def test_permisos_y_roles_gestor_y_administrador():
    """Verifica que cada rol acceda únicamente a sus operaciones autorizadas (403 para no autorizados)."""
    # Login admin
    r_adm = client.post("/api/v1/auth/login", json={"email": "admin@nexora.edu.ec", "password": "AdminNexora2026!"})
    assert r_adm.status_code == 200
    h_admin = {"Authorization": f"Bearer {r_adm.json()['access_token']}"}

    # Login gestor
    r_gst = client.post("/api/v1/auth/login", json={"email": "gestor@nexora.edu.ec", "password": "GestorNexora2026!"})
    assert r_gst.status_code == 200
    h_gestor = {"Authorization": f"Bearer {r_gst.json()['access_token']}"}

    # Registro de estudiante normal
    suf = random.randint(100000, 999999)
    r_std = client.post("/api/v1/auth/register", json={
        "nombre_completo": "Aspirante Verificacion Permisos",
        "email": f"aspirante_permisos_{suf}@nexora.edu.ec",
        "password": "Password123!",
    })
    h_student = {"Authorization": f"Bearer {r_std.json()['access_token']}"}

    # 1. Estudiante intentando acceder a panel gestor -> 403
    assert client.get("/api/v1/gestor/resumen", headers=h_student).status_code == 403
    assert client.post("/api/v1/gestor/carreras", headers=h_student, json={}).status_code == 403

    # 2. Estudiante intentando acceder a administración de usuarios -> 403
    assert client.get("/api/v1/admin/usuarios", headers=h_student).status_code == 403

    # 3. Gestor intentando administrar usuarios o roles -> 403
    assert client.get("/api/v1/admin/usuarios", headers=h_gestor).status_code == 403

    # 4. Gestor en su panel -> 200
    res_gestor = client.get("/api/v1/gestor/resumen", headers=h_gestor)
    assert res_gestor.status_code == 200
    data_resumen = res_gestor.json()
    assert "total_universidades" in data_resumen
    assert "total_carreras_unicas" in data_resumen

    # 5. Administrador en gestión de usuarios -> 200
    res_admin = client.get("/api/v1/admin/usuarios", headers=h_admin)
    assert res_admin.status_code == 200

    # 6. Administrador promueve al estudiante a gestor
    std_id = r_std.json()["usuario"]["id"]
    r_promote = client.patch(f"/api/v1/admin/usuarios/{std_id}/rol", headers=h_admin, json={"rol": "gestor"})
    assert r_promote.status_code == 200
    assert r_promote.json()["rol"] == "gestor"

    # Ahora el estudiante promovido puede acceder al panel de gestor
    assert client.get("/api/v1/gestor/resumen", headers=h_student).status_code == 200

    # 7. Gestor y Administrador intentando acceder a favoritos o evaluaciones de estudiantes -> 403
    assert client.get("/api/v1/favoritos/", headers=h_gestor).status_code == 403
    assert client.get("/api/v1/favoritos/", headers=h_admin).status_code == 403
    assert client.post("/api/v1/evaluaciones/", headers=h_gestor, json={"respuestas": {}}).status_code == 403
    assert client.post("/api/v1/evaluaciones/", headers=h_admin, json={"respuestas": {}}).status_code == 403


def test_gestor_crud_carreras_actualizacion_inmediata_y_auditoria():
    """Verifica que las modificaciones del gestor actualicen PostgreSQL en vivo con auditoría."""
    r_gst = client.post("/api/v1/auth/login", json={"email": "gestor@nexora.edu.ec", "password": "GestorNexora2026!"})
    h_gestor = {"Authorization": f"Bearer {r_gst.json()['access_token']}"}

    cod = random.randint(1000, 9999)
    nom_carrera = f"Licenciatura en Ciberseguridad {cod}"

    # 1. Gestor crea carrera
    r_create = client.post("/api/v1/gestor/carreras", headers=h_gestor, json={
        "nombre": nom_carrera,
        "institucion": "Universidad Estatal de Milagro",
        "siglas": "UNEMI",
        "facultad": "Facultad de Ciencias e Ingenierías",
        "modalidad": "En línea",
        "canton": "Milagro",
        "provincia": "Guayas",
        "duracion_semestres": 9,
        "titulo_otorga": f"Licenciado/a en Ciberseguridad {cod}",
        "enlace_oficial": "https://www.unemi.edu.ec/",
        "fuente_facultad": "Resolución Oficial 2026",
    })
    assert r_create.status_code == 201
    carr = r_create.json()
    carr_id = carr["id"]
    assert carr["modificado_por"] == "gestor@nexora.edu.ec"
    assert carr["fecha_modificacion"] is not None

    # 2. Consulta pública del estudiante: debe verla inmediatamente
    r_pub = client.get(f"/api/v1/catalogo/carreras?search=Ciberseguridad {cod}")
    assert r_pub.status_code == 200
    assert any(c["id"] == carr_id for c in r_pub.json())

    # 3. Gestor edita la carrera (duración a 8 semestres)
    r_edit = client.put(f"/api/v1/gestor/carreras/{carr_id}", headers=h_gestor, json={
        "duracion_semestres": 8,
        "observaciones": "Ajuste curricular 8 semestres"
    })
    assert r_edit.status_code == 200
    assert r_edit.json()["duracion_semestres"] == 8

    # El estudiante ve el cambio inmediatamente
    carr_pub = next(c for c in client.get(f"/api/v1/catalogo/carreras?search=Ciberseguridad {cod}").json() if c["id"] == carr_id)
    assert carr_pub["duracion_semestres"] == 8

    # 4. Desactivación lógica: retira la carrera del catálogo público
    r_deact = client.patch(f"/api/v1/gestor/carreras/{carr_id}/estado", headers=h_gestor, json={"es_vigente": False})
    assert r_deact.status_code == 200

    # El catálogo público ya no la muestra
    r_pub_after = client.get(f"/api/v1/catalogo/carreras?search=Ciberseguridad {cod}").json()
    assert not any(c["id"] == carr_id for c in r_pub_after)

    # Limpieza final de la prueba en BD
    db = SessionLocal()
    try:
        db.query(CarreraCatalogo).filter(CarreraCatalogo.id == carr_id).delete()
        db.commit()
    finally:
        db.close()
