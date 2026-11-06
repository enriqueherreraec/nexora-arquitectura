import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_flujo_huaquillas_tecnologia_y_aislamiento():
    # 1. Registro e inicio de sesión de estudiante de Huaquillas
    email_huaquillas = 'huaquillas_tech_test@ejemplo.edu.ec'
    r_reg = client.post('/api/v1/auth/register', json={
        'email': email_huaquillas,
        'password': 'Password123.',
        'nombre_completo': 'Estudiante Huaquillas Tech'
    })
    if r_reg.status_code == 400:
        r_login = client.post('/api/v1/auth/login', json={'email': email_huaquillas, 'password': 'Password123.'})
        token1 = r_login.json()['access_token']
    else:
        token1 = r_reg.json()['access_token']

    headers1 = {'Authorization': f'Bearer {token1}'}

    # 2. Configurar perfil en Huaquillas, El Oro
    r_perfil = client.put('/api/v1/perfiles/mi-perfil', headers=headers1, json={
        'provincia': 'El Oro',
        'ciudad': 'Huaquillas',
        'modalidad_preferida': 'Presencial',
        'medio_transporte': 'Autobús / Transporte público'
    })
    assert r_perfil.status_code == 200
    assert r_perfil.json()['ciudad'] == 'Huaquillas'
    assert r_perfil.json()['provincia'] == 'El Oro'

    # 3. Responder cuestionario con alto interés en Tecnología (preguntas 1, 2, 3 = 4, resto = 1)
    respuestas_tech = {str(i): (4 if i in [1, 2, 3] else 1) for i in range(1, 31)}
    r_eval1 = client.post('/api/v1/evaluaciones/', headers=headers1, json={'respuestas': respuestas_tech})
    assert r_eval1.status_code == 200
    eval1 = r_eval1.json()

    assert eval1['area_predominante'] == 'Ingeniería y Tecnología'
    assert eval1['puntuaciones_areas']['Ingeniería y Tecnología'] == 100.0

    carreras = eval1['carreras_sugeridas']
    assert len(carreras) > 0

    # Comprobaciones Huaquillas:
    # Primera opción debe ser UTMACH por cercanía a Huaquillas (~37 km)
    primera = carreras[0]
    assert primera['siglas'] == 'UTMACH'
    assert 'Machala' in primera['ciudad']
    assert primera['distancia_km'] < 45  # Huaquillas -> Machala es ~37.3 km

    # Debe incluir alternativas de otras universidades (UNL en Loja, UCuenca en Cuenca, ESPOL en Guayaquil, etc.)
    ciudades_sugeridas = [c['ciudad'] for c in carreras]
    assert 'Loja' in ciudades_sugeridas or 'Cuenca' in ciudades_sugeridas or 'Guayaquil' in ciudades_sugeridas

    # Debe excluir carreras sin afinidad (no debe aparecer Agronomía ni Medicina ni Derecho)
    areas_sugeridas = {c['area_vocacional'] for c in carreras}
    assert areas_sugeridas == {'Ingeniería y Tecnología'}

    # Todas las carreras deben tener explicación pedagógica
    for c in carreras:
        assert 'explicacion' in c and len(c['explicacion']) > 20

    # 4. Realizar otro cuestionario (intento 2)
    respuestas_intento2 = {str(i): 3 for i in range(1, 31)}
    r_eval2 = client.post('/api/v1/evaluaciones/', headers=headers1, json={'respuestas': respuestas_intento2})
    assert r_eval2.status_code == 200
    eval2 = r_eval2.json()

    # Comprobar que en el historial se conservan ambos intentos
    r_hist = client.get('/api/v1/evaluaciones/', headers=headers1)
    assert r_hist.status_code == 200
    historial = r_hist.json()
    assert len(historial) >= 2

    # 5. Cerrar sesión y volver a entrar: verificar persistencia de última evaluación
    r_ultima = client.get('/api/v1/evaluaciones/ultima', headers=headers1)
    assert r_ultima.status_code == 200
    assert r_ultima.json() is not None
    assert r_ultima.json()['id'] == eval2['id']

    # 6. Aislamiento de datos entre usuarios
    r_reg2 = client.post('/api/v1/auth/register', json={
        'email': 'estudiante_aislado_test@ejemplo.edu.ec',
        'password': 'Password123.',
        'nombre_completo': 'Estudiante Aislado'
    })
    token2 = r_reg2.json()['access_token'] if r_reg2.status_code == 201 else client.post(
        '/api/v1/auth/login', json={'email': 'estudiante_aislado_test@ejemplo.edu.ec', 'password': 'Password123.'}
    ).json()['access_token']
    headers2 = {'Authorization': f'Bearer {token2}'}

    # El Estudiante 2 no debe ver las evaluaciones del Estudiante 1 en su historial
    r_hist2 = client.get('/api/v1/evaluaciones/', headers=headers2)
    assert len(r_hist2.json()) == 0

    # El Estudiante 2 recibe 404 al intentar consultar directamente la evaluación del Estudiante 1
    r_hack = client.get(f'/api/v1/evaluaciones/{eval1["id"]}', headers=headers2)
    assert r_hack.status_code == 404
