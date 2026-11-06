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


def test_registros_utmach_y_unemi_en_postgresql():
    """Comprueba directamente en PostgreSQL la existencia de los registros específicos y sus niveles."""
    db = SessionLocal()
    try:
        # 1. UTMACH Medicina (Presencial, Vigente, Tercer Nivel)
        utmach_med = db.query(CarreraCatalogo).filter(
            CarreraCatalogo.institucion_normalizada.ilike("%machala%"),
            CarreraCatalogo.nombre_normalizado == "medicina",
            CarreraCatalogo.modalidad_normalizada == "presencial",
            CarreraCatalogo.es_tercer_nivel == True,
            CarreraCatalogo.es_vigente == True
        ).all()
        assert len(utmach_med) == 1, "Debe existir exactamente 1 registro de UTMACH Medicina sin duplicados"
        med = utmach_med[0]
        assert med.siglas == "UTMACH"
        assert med.provincia == "El Oro"
        assert med.canton == "Machala"
        assert med.area_vocacional == "Ciencias de la Salud"
        assert med.nivel_academico == "Grado / Tercer Nivel"
        assert med.es_posgrado == False

        # 2. UNEMI Software (Presencial, Vigente, Tercer Nivel de Grado)
        unemi_software_grado = db.query(CarreraCatalogo).filter(
            CarreraCatalogo.institucion_normalizada.ilike("%milagro%"),
            CarreraCatalogo.nombre_normalizado == "software",
            CarreraCatalogo.es_tercer_nivel == True,
            CarreraCatalogo.es_vigente == True
        ).all()
        assert len(unemi_software_grado) == 1, "Debe existir exactamente 1 registro de UNEMI Software grado vigente sin duplicados"
        sw_grado = unemi_software_grado[0]
        assert sw_grado.siglas == "UNEMI"
        assert sw_grado.provincia == "Guayas"
        assert sw_grado.canton == "Milagro"
        assert sw_grado.area_vocacional == "Ingeniería y Tecnología"
        assert sw_grado.es_tercer_nivel == True
        assert sw_grado.es_posgrado == False

        # 3. UTMACH Tecnologías de la Información (Vigente, Tercer Nivel)
        utmach_ti = db.query(CarreraCatalogo).filter(
            CarreraCatalogo.institucion_normalizada.ilike("%machala%"),
            CarreraCatalogo.nombre_normalizado == "tecnologias de la informacion",
            CarreraCatalogo.es_tercer_nivel == True,
            CarreraCatalogo.es_vigente == True
        ).all()
        assert len(utmach_ti) == 1, "Debe existir exactamente 1 registro de UTMACH Tecnologías de la Información vigente"

        # 4. Registros históricos o posgrados antiguos retirados del catálogo activo
        retirados = db.query(CarreraCatalogo).filter(
            CarreraCatalogo.es_vigente == False
        ).count()
        assert retirados > 1000, "Los registros antiguos no correspondientes al nuevo catálogo deben estar retirados (no vigentes)"
    finally:
        db.close()


def test_busquedas_catalogo_con_y_sin_tildes():
    """Verifica que el endpoint /catalogo/carreras normalice tildes y nombres."""
    # Búsqueda con tildes: "tecnologías de la información"
    r1 = client.get('/api/v1/catalogo/carreras', params={'search': 'tecnologías de la información'})
    assert r1.status_code == 200
    carreras1 = r1.json()
    assert len(carreras1) > 0
    instituciones1 = [c['institucion'] for c in carreras1]
    assert any('MACHALA' in inst.upper() or 'UTMACH' in inst.upper() for inst in instituciones1)

    # Búsqueda sin tildes: "tecnologias de la informacion"
    r2 = client.get('/api/v1/catalogo/carreras', params={'search': 'tecnologias de la informacion'})
    assert r2.status_code == 200
    carreras2 = r2.json()
    assert len(carreras2) == len(carreras1), "La búsqueda con y sin tildes debe arrojar los mismos resultados"

    # Búsqueda por sigla "UNEMI"
    r_unemi = client.get('/api/v1/catalogo/carreras', params={'search': 'unemi'})
    assert r_unemi.status_code == 200
    carreras_unemi = r_unemi.json()
    assert len(carreras_unemi) > 0
    assert any('Software' in c['nombre'] for c in carreras_unemi)

    # Búsqueda por "Medicina"
    r_med = client.get('/api/v1/catalogo/carreras', params={'search': 'medicina'})
    assert r_med.status_code == 200
    carreras_med = r_med.json()
    assert any(c['siglas'] == 'UTMACH' for c in carreras_med)


def test_recomendacion_vocacional_medicina_salud():
    """Verifica que un perfil con intereses en salud reciba Medicina de UTMACH."""
    # 1. Crear usuario de prueba
    email = "test_salud_utmach@nexora.edu.ec"
    r_reg = client.post('/api/v1/auth/register', json={
        'email': email,
        'password': 'Password123.',
        'nombre_completo': 'Aspirante Medicina'
    })
    token = r_reg.json()['access_token'] if r_reg.status_code == 201 else client.post(
        '/api/v1/auth/login', json={'email': email, 'password': 'Password123.'}
    ).json()['access_token']

    headers = {'Authorization': f'Bearer {token}'}

    # 2. Configurar perfil en El Oro (Machala o Huaquillas)
    client.put('/api/v1/perfiles/mi-perfil', headers=headers, json={
        'provincia': 'El Oro',
        'ciudad': 'Machala',
        'modalidad_preferida': 'Presencial',
        'medio_transporte': 'Transporte público'
    })

    # 3. Responder con alto interés en Ciencias de la Salud (preguntas 4, 5, 6 = 4, resto = 1)
    respuestas_salud = {str(i): (4 if i in [4, 5, 6] else 1) for i in range(1, 31)}
    r_eval = client.post('/api/v1/evaluaciones/', headers=headers, json={'respuestas': respuestas_salud})
    assert r_eval.status_code == 200
    data = r_eval.json()

    assert data['area_predominante'] == 'Ciencias de la Salud'
    sugeridas = data['carreras_sugeridas']
    assert len(sugeridas) > 0

    # Todas las carreras sugeridas deben ser de Ciencias de la Salud
    for c in sugeridas:
        assert c['area_vocacional'] == 'Ciencias de la Salud'

    # UTMACH Medicina debe estar recomendada en las opciones principales
    utmach_salud = [c for c in sugeridas if c['siglas'] == 'UTMACH']
    assert len(utmach_salud) > 0
    assert any('Medicina' in c['nombre'] for c in utmach_salud)
    med_opt = next(c for c in utmach_salud if 'Medicina' in c['nombre'])
    assert med_opt['distancia_km'] < 15
    assert 'explicacion' in med_opt and len(med_opt['explicacion']) > 20


def test_recomendacion_vocacional_unemi_ti_en_linea():
    """Verifica que un perfil con intereses en tecnología y modalidad En Línea reciba UNEMI TI En Línea."""
    email = "test_unemi_online@nexora.edu.ec"
    r_reg = client.post('/api/v1/auth/register', json={
        'email': email,
        'password': 'Password123.',
        'nombre_completo': 'Aspirante TI Virtual'
    })
    token = r_reg.json()['access_token'] if r_reg.status_code == 201 else client.post(
        '/api/v1/auth/login', json={'email': email, 'password': 'Password123.'}
    ).json()['access_token']

    headers = {'Authorization': f'Bearer {token}'}

    # Perfil con modalidad preferida 'En Línea'
    client.put('/api/v1/perfiles/mi-perfil', headers=headers, json={
        'provincia': 'Guayas',
        'ciudad': 'Guayaquil',
        'modalidad_preferida': 'En Línea',
        'medio_transporte': 'Transporte público'
    })

    # Responder con alto interés en Tecnología (preguntas 1, 2, 3 = 4, resto = 1)
    respuestas_tech = {str(i): (4 if i in [1, 2, 3] else 1) for i in range(1, 31)}
    r_eval = client.post('/api/v1/evaluaciones/', headers=headers, json={'respuestas': respuestas_tech})
    assert r_eval.status_code == 200
    data = r_eval.json()

    assert data['area_predominante'] == 'Ingeniería y Tecnología'
    sugeridas = data['carreras_sugeridas']
    assert len(sugeridas) > 0

    # Debe incluir UNEMI (universidad de Guayas) con Software y opciones En Línea disponibles
    unemi_sw_encontrada = any(
        (c['siglas'] == 'UNEMI' and 'Software' in c['nombre'])
        for c in sugeridas
    )
    assert unemi_sw_encontrada, f"UNEMI Software debe estar en las recomendaciones de Guayas. Ofertas obtenidas: {[(c['siglas'], c['nombre'], c['modalidad']) for c in sugeridas]}"

    # Debe incluir carreras tecnológicas en modalidad En Línea (como UTM Realidad Virtual)
    online_encontrada = any(
        ('línea' in c['modalidad'].lower() or 'linea' in c['modalidad'].lower())
        for c in sugeridas
    )
    assert online_encontrada, "Debe incluir opciones tecnológicas en modalidad En Línea"

    # No debe recomendar posgrado en orientación vocacional
    for c in sugeridas:
        assert c.get('es_posgrado') is not True
        assert 'Posgrado' not in c.get('nivel_academico', '')
