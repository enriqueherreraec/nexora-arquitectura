import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_flujo_comparador_perfil_tecnologico():
    """
    Verifica que un perfil con interés exclusivo en tecnología:
    1. Recibe 'Ingeniería y Tecnología' como área predominante.
    2. Sus opciones recomendadas corresponden a carreras tecnológicas.
    3. Ninguna de las opciones recomendadas principales es Medicina.
    4. Cada oferta contiene los campos requeridos para la tabla comparativa.
    """
    email_tech = "estudiante_tech_comparador@nexora.edu.ec"
    r_reg = client.post('/api/v1/auth/register', json={
        'email': email_tech,
        'password': 'Password123.',
        'nombre_completo': 'Estudiante Tecnológico'
    })
    token = r_reg.json()['access_token'] if r_reg.status_code == 201 else client.post(
        '/api/v1/auth/login', json={'email': email_tech, 'password': 'Password123.'}
    ).json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # Perfil en Pichincha / Quito
    client.put('/api/v1/perfiles/mi-perfil', headers=headers, json={
        'provincia': 'Pichincha',
        'ciudad': 'Quito',
        'modalidad_preferida': 'Presencial',
        'medio_transporte': 'Transporte público'
    })

    # Responder con alto interés en Tecnología (preguntas 1 y 2 = 4, resto = 1 para v3 20 preguntas)
    respuestas_tech = {str(i): (4 if i in [1, 2] else 1) for i in range(1, 21)}
    r_eval = client.post('/api/v1/evaluaciones/', headers=headers, json={'respuestas': respuestas_tech})
    assert r_eval.status_code == 200
    data = r_eval.json()

    assert data['area_predominante'] == 'Ingeniería y Tecnología'
    sugeridas = data['carreras_sugeridas']
    assert len(sugeridas) >= 2, "Debe tener al menos 2 recomendaciones"

    # Verificar que las carreras sugeridas son tecnológicas y NO Medicina
    for c in sugeridas:
        assert c['area_vocacional'] == 'Ingeniería y Tecnología', f"Carrera {c['nombre']} debe ser de tecnología"
        assert 'medicina' not in c['nombre'].lower(), f"No debe incluir Medicina en un perfil tecnológico: {c['nombre']}"

    # Verificar presencia de campos para la tabla comparativa
    primera = sugeridas[0]
    assert 'nombre' in primera and primera['nombre']
    assert 'institucion' in primera and primera['institucion']
    assert 'siglas' in primera
    assert 'ciudad' in primera and primera['ciudad']
    assert 'provincia' in primera and primera['provincia']
    assert 'modalidad' in primera and primera['modalidad']
    assert 'duracion_semestres' in primera
    assert 'afinidad_vocacional' in primera and primera['afinidad_vocacional'] > 0
    assert 'referencia_puntaje' in primera
    assert 'tipo_referencia' in primera
    assert 'enlace_oficial' in primera or 'pagina_web' in primera


def test_flujo_comparador_perfil_salud():
    """
    Verifica que un perfil con interés exclusivo en salud:
    1. Recibe 'Ciencias de la Salud' como área predominante.
    2. Sus opciones recomendadas corresponden a carreras del área médica/salud.
    3. Incluye ofertas pertinentes de salud (ej. Medicina / Enfermería / Odontología).
    """
    email_salud = "estudiante_salud_comparador@nexora.edu.ec"
    r_reg = client.post('/api/v1/auth/register', json={
        'email': email_salud,
        'password': 'Password123.',
        'nombre_completo': 'Estudiante Salud'
    })
    token = r_reg.json()['access_token'] if r_reg.status_code == 201 else client.post(
        '/api/v1/auth/login', json={'email': email_salud, 'password': 'Password123.'}
    ).json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # Perfil en El Oro / Machala
    client.put('/api/v1/perfiles/mi-perfil', headers=headers, json={
        'provincia': 'El Oro',
        'ciudad': 'Machala',
        'modalidad_preferida': 'Presencial',
        'medio_transporte': 'Transporte público'
    })

    # Responder con alto interés en Salud (preguntas 3 y 4 = 4, resto = 1)
    respuestas_salud = {str(i): (4 if i in [3, 4] else 1) for i in range(1, 21)}
    r_eval = client.post('/api/v1/evaluaciones/', headers=headers, json={'respuestas': respuestas_salud})
    assert r_eval.status_code == 200
    data = r_eval.json()

    assert data['area_predominante'] == 'Ciencias de la Salud'
    sugeridas = data['carreras_sugeridas']
    assert len(sugeridas) >= 2

    for c in sugeridas:
        assert c['area_vocacional'] == 'Ciencias de la Salud'

    # Al ser un perfil de Salud en El Oro, debe figurar Medicina
    nombres_carreras = [c['nombre'].lower() for c in sugeridas]
    assert any('medicina' in n for n in nombres_carreras), "Un perfil de salud en El Oro debe tener Medicina recomendada"


def test_aislamiento_de_evaluaciones_entre_usuarios():
    """
    Verifica que un usuario nuevo sin cuestionario devuelva None en /evaluaciones/ultima,
    garantizando que ninguna cuenta nueva herede recomendaciones ni selecciones de otra cuenta.
    """
    email_vacio = "estudiante_nuevo_sin_test@nexora.edu.ec"
    r_reg = client.post('/api/v1/auth/register', json={
        'email': email_vacio,
        'password': 'Password123.',
        'nombre_completo': 'Usuario Nuevo Vacío'
    })
    token = r_reg.json()['access_token'] if r_reg.status_code == 201 else client.post(
        '/api/v1/auth/login', json={'email': email_vacio, 'password': 'Password123.'}
    ).json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # Consultar última evaluación: debe ser null
    r_ultima = client.get('/api/v1/evaluaciones/ultima', headers=headers)
    assert r_ultima.status_code == 200
    assert r_ultima.json() is None, "Un usuario nuevo no debe tener evaluaciones ni recomendaciones heredadas"
