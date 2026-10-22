from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from src.models.evaluacion import Evaluacion


def test_crear_evaluacion_exitosa(client: TestClient, headers_estudiante_a: dict, db: Session):
    """
    Verifica el registro exitoso de una evaluación con 20 respuestas Likert (HU-02, CA-02.1).
    Debe persistir en PostgreSQL y calcular puntuaciones para las 10 áreas.
    """
    respuestas = {str(i): 4 if i in [1, 11] else 2 for i in range(1, 21)}

    response = client.post(
        "/api/v1/evaluaciones",
        json={"respuestas": respuestas},
        headers=headers_estudiante_a
    )
    assert response.status_code == 201
    data = response.json()
    assert data["usuario_id"] == 1
    assert data["area_predominante"] == "Tecnología e Innovación"
    assert data["puntuaciones_areas"]["Tecnología e Innovación"] == 8
    assert data["version_cuestionario"] == "3.0-20preguntas"
    assert len(data["carreras_sugeridas"]) > 0

    # Verificar persistencia real en la base de datos PostgreSQL
    eval_db = db.query(Evaluacion).filter(Evaluacion.id == data["id"]).first()
    assert eval_db is not None
    assert eval_db.usuario_id == 1
    assert eval_db.area_predominante == "Tecnología e Innovación"


def test_crear_evaluacion_incompleta_400(client: TestClient, headers_estudiante_a: dict):
    """
    Verifica que se rechacen cuestionarios con menos de 20 preguntas (CA-02.2).
    Debe responder con HTTP 400 Bad Request detallando las preguntas faltantes.
    """
    respuestas_incompletas = {str(i): 3 for i in range(1, 15)}  # Solo 14 preguntas

    response = client.post(
        "/api/v1/evaluaciones",
        json={"respuestas": respuestas_incompletas},
        headers=headers_estudiante_a
    )
    assert response.status_code == 400
    assert "Preguntas faltantes" in response.json()["detail"]


def test_crear_evaluacion_claves_desconocidas_400(client: TestClient, headers_estudiante_a: dict):
    """
    Verifica que se rechacen cuestionarios con preguntas adicionales o claves no permitidas.
    Debe responder con HTTP 400 Bad Request sin ignorar silenciosamente las claves extra.
    """
    respuestas_con_extra = {str(i): 3 for i in range(1, 21)}
    respuestas_con_extra["21"] = 4
    respuestas_con_extra["pregunta_extra"] = 2

    response = client.post(
        "/api/v1/evaluaciones",
        json={"respuestas": respuestas_con_extra},
        headers=headers_estudiante_a
    )
    assert response.status_code == 400
    assert "Preguntas no permitidas o desconocidas" in response.json()["detail"]


def test_crear_evaluacion_valor_fuera_de_rango_400(client: TestClient, headers_estudiante_a: dict):
    """
    Verifica que se rechacen valores fuera de la escala Likert (0 a 4).
    Debe responder con HTTP 400 Bad Request sin recortar silenciosamente los valores.
    """
    respuestas_fuera_rango = {str(i): 3 for i in range(1, 21)}
    respuestas_fuera_rango["5"] = 5   # Mayor a 4
    respuestas_fuera_rango["10"] = -1  # Menor a 0

    response = client.post(
        "/api/v1/evaluaciones",
        json={"respuestas": respuestas_fuera_rango},
        headers=headers_estudiante_a
    )
    assert response.status_code == 400
    assert "fuera de rango Likert" in response.json()["detail"]


def test_crear_evaluacion_tipo_no_entero_422(client: TestClient, headers_estudiante_a: dict):
    """
    Verifica que el envío de tipos incompatibles (cadenas no numéricas en valores)
    sea capturado por la validación sintáctica estricta retornando HTTP 422 Unprocessable Entity.
    """
    respuestas_tipo_erroneo = {str(i): 3 for i in range(1, 21)}
    respuestas_tipo_erroneo["1"] = "cuatro"

    response = client.post(
        "/api/v1/evaluaciones",
        json={"respuestas": respuestas_tipo_erroneo},
        headers=headers_estudiante_a
    )
    assert response.status_code == 422


def test_crear_evaluacion_rechaza_booleano_422(client: TestClient, headers_estudiante_a: dict):
    """
    Verifica que la validación estricta (StrictInt) rechace valores booleanos (True/False)
    con HTTP 422 Unprocessable Entity en lugar de convertirlos a 1 o 0.
    """
    respuestas = {str(i): 2 for i in range(1, 21)}
    respuestas["1"] = True

    response = client.post(
        "/api/v1/evaluaciones",
        json={"respuestas": respuestas},
        headers=headers_estudiante_a
    )
    assert response.status_code == 422


def test_crear_evaluacion_rechaza_cadena_numerica_422(client: TestClient, headers_estudiante_a: dict):
    """
    Verifica que la validación estricta (StrictInt) rechace cadenas numéricas ("4")
    con HTTP 422 Unprocessable Entity en lugar de convertirlas a entero.
    """
    respuestas = {str(i): 2 for i in range(1, 21)}
    respuestas["1"] = "4"

    response = client.post(
        "/api/v1/evaluaciones",
        json={"respuestas": respuestas},
        headers=headers_estudiante_a
    )
    assert response.status_code == 422


def test_crear_evaluacion_rechaza_flotante_422(client: TestClient, headers_estudiante_a: dict):
    """
    Verifica que la validación estricta (StrictInt) rechace números flotantes (4.0)
    con HTTP 422 Unprocessable Entity en lugar de truncarlos a entero.
    """
    respuestas = {str(i): 2 for i in range(1, 21)}
    respuestas["1"] = 4.0

    response = client.post(
        "/api/v1/evaluaciones",
        json={"respuestas": respuestas},
        headers=headers_estudiante_a
    )
    assert response.status_code == 422


def test_transaccionalidad_reversion_e2(client: TestClient, headers_estudiante_a: dict, db: Session):
    """
    Verifica el escenario E2 del dossier de arquitectura mediante una prueba real de rollback:
    Se envía un payload 100 % válido con las 20 respuestas Likert (valores de 0 a 4).
    La API ejecuta la validación sintáctica, realiza el cálculo vocacional, agrega el objeto
    al Session y ejecuta db.flush(), generando una escritura real no confirmada en PostgreSQL.
    En ese punto exacto se inyecta un fallo durante la transacción antes del commit.

    Se comprueba:
    1. Que la solicitud alcance la capa de persistencia y retorne HTTP 500 por el fallo inyectado.
    2. Que la API ejecute db.rollback() revirtiendo la escritura no confirmada.
    3. Que una sesión completamente nueva e independiente (SessionLocal) consulte PostgreSQL
       y confirme 0 registros parciales o huérfanos creados.
    4. Que el contenido exacto de las evaluaciones históricas (ID 101) permanezca intacto.
    5. Que este ciclo de fallo inducido y rollback se repita rigurosamente en 30 ejecuciones consecutivas.
    """
    import os
    from src.core.database import SessionLocal

    # Snapshot inicial del historial
    eval_historica_inicial = db.query(Evaluacion).filter(Evaluacion.id == 101).first()
    assert eval_historica_inicial is not None
    respuestas_historicas_iniciales = dict(eval_historica_inicial.respuestas_json)
    puntuaciones_historicas_iniciales = dict(eval_historica_inicial.puntuaciones_areas)
    conteo_inicial = db.query(Evaluacion).count()

    fallos_transaccionales_inducidos = 0
    payload_valido = {"respuestas": {str(k): 3 for k in range(1, 21)}}

    # Activar inyección de fallo transaccional durante el flush/commit
    os.environ["INDUCIR_FALLO_TRANSACCION_E2"] = "true"

    try:
        for intento in range(30):
            response = client.post(
                "/api/v1/evaluaciones",
                json=payload_valido,
                headers=headers_estudiante_a
            )
            # La API debe capturar el fallo tras el flush y retornar HTTP 500 controlado con rollback
            if response.status_code == 500:
                fallos_transaccionales_inducidos += 1
                assert "Error en persistencia transaccional" in response.json()["detail"]

            # Comprobar con una sesión NUEVA e independiente que no existan escrituras parciales en PostgreSQL
            with SessionLocal() as nueva_sesion:
                conteo_actual = nueva_sesion.query(Evaluacion).count()
                assert conteo_actual == conteo_inicial, (
                    f"Fallo de atomicidad en intento {intento + 1}: el conteo cambió de {conteo_inicial} a {conteo_actual}"
                )
                registros_parciales = nueva_sesion.query(Evaluacion).filter(
                    Evaluacion.usuario_id == 1,
                    Evaluacion.id != 101
                ).count()
                assert registros_parciales == 0, (
                    f"Se detectaron {registros_parciales} registros parciales no revertidos en intento {intento + 1}"
                )
    finally:
        # Desactivar la inyección de fallos para restaurar la operación normal
        os.environ["INDUCIR_FALLO_TRANSACCION_E2"] = "false"

    # Verificar que se ejecutaron efectivamente los 30 intentos con fallo y rollback
    assert fallos_transaccionales_inducidos == 30, (
        f"Se esperaban 30 fallos inducidos tras escritura, se obtuvieron {fallos_transaccionales_inducidos}"
    )

    # Verificar con una sesión fresca que el historial no sufrió ninguna alteración
    with SessionLocal() as sesion_verificacion:
        eval_historica_final = sesion_verificacion.query(Evaluacion).filter(Evaluacion.id == 101).first()
        assert eval_historica_final is not None
        assert eval_historica_final.respuestas_json == respuestas_historicas_iniciales
        assert eval_historica_final.puntuaciones_areas == puntuaciones_historicas_iniciales
        assert eval_historica_final.version_cuestionario == "3.0-20preguntas"
        assert sesion_verificacion.query(Evaluacion).count() == conteo_inicial


def test_obtener_ultima_evaluacion_propia(client: TestClient, headers_estudiante_a: dict):
    """
    Verifica la recuperación de la última evaluación propia del estudiante (HU-03, CA-03.1).
    """
    response = client.get("/api/v1/evaluaciones/ultima", headers=headers_estudiante_a)
    assert response.status_code == 200
    data = response.json()
    assert data is not None
    assert data["usuario_id"] == 1
    assert data["area_predominante"] == "Tecnología e Innovación"


def test_obtener_ultima_evaluacion_sin_registros(client: TestClient, db: Session):
    """
    Verifica que un estudiante sin historial reciba null con HTTP 200 (CA-03.2).
    """
    # Crear usuario C sin evaluaciones
    from src.models.usuario import Usuario
    from src.core.security import hash_password, create_access_token
    from datetime import timedelta

    user_c = Usuario(id=99, email="nuevo@ejemplo.edu.ec", password_hash=hash_password("Pass123!"), nombre_completo="Nuevo", rol="estudiante", activo=True)
    db.add(user_c)
    db.commit()

    token_c = create_access_token(data={"sub": "nuevo@ejemplo.edu.ec", "uid": 99, "rol": "estudiante"}, expires_delta=timedelta(hours=1))
    response = client.get("/api/v1/evaluaciones/ultima", headers={"Authorization": f"Bearer {token_c}"})
    assert response.status_code == 200
    assert response.json() is None


def test_consulta_sin_token_401(client: TestClient):
    """
    Verifica que la consulta sin cabecera de autenticación sea rechazada con HTTP 401 (CA-03.3).
    """
    response = client.get("/api/v1/evaluaciones/ultima")
    assert response.status_code == 401


def test_aislamiento_estricto_entre_cuentas(client: TestClient, headers_estudiante_a: dict, headers_estudiante_b: dict):
    """
    Verifica el aislamiento estricto de propiedad (E1, E3, ADR-001):
    El Estudiante A obtiene exclusivamente sus resultados (Tecnología)
    y el Estudiante B obtiene exclusivamente los suyos (Salud).
    """
    resp_a = client.get("/api/v1/evaluaciones/ultima", headers=headers_estudiante_a)
    assert resp_a.status_code == 200
    assert resp_a.json()["usuario_id"] == 1
    assert resp_a.json()["area_predominante"] == "Tecnología e Innovación"

    resp_b = client.get("/api/v1/evaluaciones/ultima", headers=headers_estudiante_b)
    assert resp_b.status_code == 200
    assert resp_b.json()["usuario_id"] == 2
    assert resp_b.json()["area_predominante"] == "Ciencias de la Salud"


def test_evaluacion_todas_cero(client: TestClient, headers_estudiante_a: dict):
    """
    Verifica el tratamiento no arbitrario cuando todas las respuestas son 0 (CA-02.4).
    """
    respuestas_cero = {str(i): 0 for i in range(1, 21)}
    response = client.post(
        "/api/v1/evaluaciones",
        json={"respuestas": respuestas_cero},
        headers=headers_estudiante_a
    )
    assert response.status_code == 201
    data = response.json()
    assert data["todas_cero"] is True
    assert len(data["carreras_sugeridas"]) == 0
