import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.modules.catalogo.models import CarreraCatalogo

client = TestClient(app)


def test_banco_preguntas_y_diez_areas():
    """Comprueba que existan exactamente veinte preguntas, dos por cada área, cuatro páginas de 5 preguntas y las diez áreas oficiales."""
    r = client.get('/api/v1/cuestionario/preguntas')
    assert r.status_code == 200
    data = r.json()

    assert data['total_preguntas'] == 20
    assert len(data['preguntas']) == 20
    assert data['total_areas'] == 10
    assert len(data['areas']) == 10
    assert data['total_paginas'] == 4
    assert data['preguntas_por_pagina'] == 5
    assert data['version'] == "3.0-20preguntas"

    # Instrucciones exactas para el estudiante
    assert "Imagina que puedes aprender a realizar cada actividad" in data['instrucciones']
    assert "no hay respuestas correctas o incorrectas" in data['instrucciones']

    # Las 10 áreas oficiales
    areas_esperadas = [
        "Ingeniería y Tecnología",
        "Ciencias de la Salud",
        "Ciencias Administrativas y Económicas",
        "Derecho y Ciencias Sociales",
        "Educación y Pedagogía",
        "Ciencias Agropecuarias y Veterinaria",
        "Ciencias Naturales y Matemáticas",
        "Artes y Humanidades",
        "Arquitectura y Diseño",
        "Comunicación"
    ]
    assert data['areas'] == areas_esperadas

    # Exactamente 2 preguntas por área
    conteo_por_area = {}
    for p in data['preguntas']:
        area = p['area']
        conteo_por_area[area] = conteo_por_area.get(area, 0) + 1
        # Comprobar que cada pregunta incluya ejemplo acorde para 'Necesito un ejemplo'
        assert 'ejemplo' in p and len(p['ejemplo']) > 10
        # Comprobar orden de presentación consecutivo (1..20)
        assert 1 <= p['orden_presentacion'] <= 20
        assert 1 <= p['pagina'] <= 4

    for area in areas_esperadas:
        assert conteo_por_area[area] == 2

    # Comprobar intercalación de las 4 páginas de 5 preguntas
    ids_p1 = [p['id'] for p in data['preguntas'][:5]]
    ids_p2 = [p['id'] for p in data['preguntas'][5:10]]
    ids_p3 = [p['id'] for p in data['preguntas'][10:15]]
    ids_p4 = [p['id'] for p in data['preguntas'][15:20]]

    assert ids_p1 == [1, 3, 5, 7, 9]
    assert ids_p2 == [11, 13, 15, 17, 19]
    assert ids_p3 == [2, 4, 6, 8, 10]
    assert ids_p4 == [12, 14, 16, 18, 20]

    # Opciones de la escala: Nada (0) a Mucho (4)
    assert len(data['opciones']) == 5
    valores = [o['valor'] for o in data['opciones']]
    assert valores == [0, 1, 2, 3, 4]


def test_verificacion_utmach_medicina_y_unemi_ti():
    """Comprueba que aparezcan Medicina de UTMACH y TI en línea de UNEMI con sus tipos de referencia y periodos."""
    db = SessionLocal()
    try:
        # 1. UTMACH Medicina
        med_utmach = db.query(CarreraCatalogo).filter(
            CarreraCatalogo.siglas == 'UTMACH',
            CarreraCatalogo.nombre == 'Medicina',
            CarreraCatalogo.modalidad == 'Presencial'
        ).first()
        assert med_utmach is not None, "Medicina UTMACH debe existir"
        assert med_utmach.referencia_puntaje == '927'
        assert med_utmach.periodo_puntaje == '2026-1'
        assert med_utmach.tipo_referencia == 'Mínimo y máximo histórico de asignación'
        assert 'Ciencias Químicas y de la Salud' in med_utmach.facultad
        assert med_utmach.area_vocacional == 'Ciencias de la Salud'

        # 2. UNEMI Tecnologías de la Información en línea
        ti_unemi = db.query(CarreraCatalogo).filter(
            CarreraCatalogo.siglas == 'UNEMI',
            CarreraCatalogo.nombre.ilike('%TECNOLOG%AS DE LA INFORMACI%N%'),
            CarreraCatalogo.modalidad == 'En Línea',
            CarreraCatalogo.es_posgrado == False
        ).first()
        assert ti_unemi is not None, "TI en línea de UNEMI debe existir"
        assert ti_unemi.referencia_puntaje == 'Sin dato oficial verificado'
        assert ti_unemi.tipo_referencia == 'No se calcula promedio sin datos comparables'
        assert ti_unemi.area_vocacional == 'Ingeniería y Tecnología'
    finally:
        db.close()


def test_dos_perfiles_huaquillas_tecnologia_vs_salud_20_preguntas():
    """
    Prueba un estudiante de Huaquillas con interés en tecnología y otro con interés en salud.
    Verifica que el cálculo corresponda a (suma/8)*100, reciban recomendaciones diferentes,
    y que aparezcan las opciones pertinentes de UTMACH y alternativas de otras universidades.
    """
    # 1. Estudiante A: Huaquillas + Tecnología
    email_a = 'huaquillas_tech_v3@test.edu.ec'
    r_reg_a = client.post('/api/v1/auth/register', json={
        'email': email_a,
        'password': 'Password123.',
        'nombre_completo': 'Estudiante Huaquillas Tecnología v3'
    })
    token_a = r_reg_a.json()['access_token'] if r_reg_a.status_code == 201 else client.post(
        '/api/v1/auth/login', json={'email': email_a, 'password': 'Password123.'}
    ).json()['access_token']
    headers_a = {'Authorization': f'Bearer {token_a}'}

    # Configurar perfil Huaquillas
    client.put('/api/v1/perfiles/mi-perfil', headers=headers_a, json={
        'provincia': 'El Oro',
        'ciudad': 'Huaquillas',
        'modalidad_preferida': 'Presencial',
        'medio_transporte': 'Transporte público'
    })

    # Respuestas de Tecnología: Preguntas 1 y 2 = 4 (Mucho), resto = 1 (Poco)
    respuestas_tech = {}
    for i in range(1, 21):
        respuestas_tech[str(i)] = 4 if i in [1, 2] else 1

    r_eval_a = client.post('/api/v1/evaluaciones/', headers=headers_a, json={'respuestas': respuestas_tech})
    assert r_eval_a.status_code == 200
    res_a = r_eval_a.json()

    # Cálculo exacto sobre 8: (4+4)/8 * 100 = 100% para Ingeniería y Tecnología
    assert res_a['area_predominante'] == 'Ingeniería y Tecnología'
    assert res_a['puntuaciones_areas']['Ingeniería y Tecnología'] == 100.0
    assert res_a['version_cuestionario'] == '3.0-20preguntas'
    assert res_a['max_puntos_por_area'] == 8
    # Las demás áreas: (1+1)/8 * 100 = 25.0%
    assert res_a['puntuaciones_areas']['Ciencias de la Salud'] == 25.0

    # Recomendaciones para Tecnología:
    carreras_a = res_a['carreras_sugeridas']
    assert len(carreras_a) > 0
    # Primera opción más cercana pertinente debe ser UTMACH (Machala ~37 km)
    assert carreras_a[0]['siglas'] == 'UTMACH'
    assert 'Machala' in carreras_a[0]['ciudad']
    assert carreras_a[0]['distancia_km'] < 45
    nombres_a = [c['nombre'].upper() for c in carreras_a]
    assert any('TECNOLOG' in n or 'SOFTWARE' in n or 'COMPUTACI' in n or 'SISTEMAS' in n for n in nombres_a)
    # Conserva alternativas de otras universidades
    universidades_a = {c['siglas'] for c in carreras_a}
    assert len(universidades_a) > 1

    # 2. Estudiante B: Huaquillas + Salud
    email_b = 'huaquillas_salud_v3@test.edu.ec'
    r_reg_b = client.post('/api/v1/auth/register', json={
        'email': email_b,
        'password': 'Password123.',
        'nombre_completo': 'Estudiante Huaquillas Salud v3'
    })
    token_b = r_reg_b.json()['access_token'] if r_reg_b.status_code == 201 else client.post(
        '/api/v1/auth/login', json={'email': email_b, 'password': 'Password123.'}
    ).json()['access_token']
    headers_b = {'Authorization': f'Bearer {token_b}'}

    client.put('/api/v1/perfiles/mi-perfil', headers=headers_b, json={
        'provincia': 'El Oro',
        'ciudad': 'Huaquillas',
        'modalidad_preferida': 'Presencial',
        'medio_transporte': 'Transporte público'
    })

    # Respuestas de Salud: Preguntas 3 y 4 = 4 (Mucho), resto = 0 (Nada)
    respuestas_salud = {}
    for i in range(1, 21):
        respuestas_salud[str(i)] = 4 if i in [3, 4] else 0

    r_eval_b = client.post('/api/v1/evaluaciones/', headers=headers_b, json={'respuestas': respuestas_salud})
    assert r_eval_b.status_code == 200
    res_b = r_eval_b.json()

    # Cálculo exacto sobre 8: (4+4)/8 * 100 = 100%
    assert res_b['area_predominante'] == 'Ciencias de la Salud'
    assert res_b['puntuaciones_areas']['Ciencias de la Salud'] == 100.0
    assert res_b['puntuaciones_areas']['Ingeniería y Tecnología'] == 0.0
    assert res_b['max_puntos_por_area'] == 8

    # Recomendaciones para Salud:
    carreras_b = res_b['carreras_sugeridas']
    assert len(carreras_b) > 0
    # Primera opción pertinente debe ser de UTMACH de Salud (Medicina / Enfermería)
    assert carreras_b[0]['siglas'] == 'UTMACH'
    assert 'Machala' in carreras_b[0]['ciudad']
    nombres_b = [c['nombre'].upper() for c in carreras_b]
    assert any('MEDICINA' in n or 'ENFERMER' in n for n in nombres_b)

    # Dos perfiles con intereses distintos reciben recomendaciones claramente diferentes
    assert res_a['area_predominante'] != res_b['area_predominante']
    assert [c['nombre'] for c in carreras_a[:3]] != [c['nombre'] for c in carreras_b[:3]]


def test_manejo_de_empate_y_todas_cero_20_preguntas():
    """
    Comprueba:
    1. Si existe un empate, muestra las áreas empatadas sin seleccionar una ganadora arbitrariamente.
    2. Si todas las áreas tienen puntuación cero ('Nada'), explica que todavía no existe preferencia identificada.
    """
    email_tie = 'empate_v3@test.edu.ec'
    r_reg = client.post('/api/v1/auth/register', json={
        'email': email_tie,
        'password': 'Password123.',
        'nombre_completo': 'Estudiante Empate v3'
    })
    token = r_reg.json()['access_token'] if r_reg.status_code == 201 else client.post(
        '/api/v1/auth/login', json={'email': email_tie, 'password': 'Password123.'}
    ).json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # Caso 1: Empate entre Artes y Humanidades (Q15, 16 = 4) y Comunicación (Q19, 20 = 4)
    respuestas_empate = {str(i): 0 for i in range(1, 21)}
    for q in [15, 16, 19, 20]:
        respuestas_empate[str(q)] = 4

    r_empate = client.post('/api/v1/evaluaciones/', headers=headers, json={'respuestas': respuestas_empate})
    assert r_empate.status_code == 200
    res_emp = r_empate.json()
    assert res_emp['es_empate'] is True
    assert 'Artes y Humanidades' in res_emp['areas_empatadas']
    assert 'Comunicación' in res_emp['areas_empatadas']
    assert len(res_emp['areas_empatadas']) == 2
    assert res_emp['puntuaciones_areas']['Artes y Humanidades'] == 100.0
    assert res_emp['puntuaciones_areas']['Comunicación'] == 100.0

    # Caso 2: Todas con puntuación 0 ('Nada')
    respuestas_cero = {str(i): 0 for i in range(1, 21)}
    r_cero = client.post('/api/v1/evaluaciones/', headers=headers, json={'respuestas': respuestas_cero})
    assert r_cero.status_code == 200
    res_cero = r_cero.json()
    assert res_cero['todas_cero'] is True
    assert "no existe una preferencia identificada" in res_cero['mensaje_resultado']
    assert all(v == 0.0 for v in res_cero['puntuaciones_areas'].values())


def test_descarga_pdf_y_persistencia_historial_20_preguntas():
    """Comprueba la generación del PDF con ReportLab (sobre 8 pts) y la persistencia del historial tras nuevos intentos."""
    email = 'historial_pdf_v3@test.edu.ec'
    r_reg = client.post('/api/v1/auth/register', json={
        'email': email,
        'password': 'Password123.',
        'nombre_completo': 'Estudiante PDF e Historial v3'
    })
    token = r_reg.json()['access_token'] if r_reg.status_code == 201 else client.post(
        '/api/v1/auth/login', json={'email': email, 'password': 'Password123.'}
    ).json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # Realizar intento 1 (20 preguntas)
    resp1 = {str(i): 2 for i in range(1, 21)}
    r1 = client.post('/api/v1/evaluaciones/', headers=headers, json={'respuestas': resp1})
    assert r1.status_code == 200
    id1 = r1.json()['id']
    assert r1.json()['max_puntos_por_area'] == 8

    # Realizar intento 2 (Realizar otro cuestionario)
    resp2 = {str(i): (4 if i in [5, 6] else 1) for i in range(1, 21)}
    r2 = client.post('/api/v1/evaluaciones/', headers=headers, json={'respuestas': resp2})
    assert r2.status_code == 200
    id2 = r2.json()['id']
    assert id1 != id2

    # Verificar historial: deben existir ambos intentos con version_cuestionario y max_puntos_por_area
    r_hist = client.get('/api/v1/evaluaciones/', headers=headers)
    assert r_hist.status_code == 200
    hist = r_hist.json()
    ids_hist = [h['id'] for h in hist]
    assert id1 in ids_hist and id2 in ids_hist

    # Comprobar descarga de PDF de la evaluación
    r_pdf = client.get(f'/api/v1/informes/{id2}/pdf', headers=headers)
    assert r_pdf.status_code == 200
    assert r_pdf.headers['content-type'] == 'application/pdf'
    assert len(r_pdf.content) > 1000  # PDF válido generado por ReportLab
