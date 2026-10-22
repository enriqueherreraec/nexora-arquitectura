from typing import Dict, Any, List

# Mapeo oficial de las 20 preguntas Likert hacia las 10 áreas vocacionales
PREGUNTAS_A_AREAS = {
    1: "Tecnología e Innovación",
    11: "Tecnología e Innovación",
    2: "Ciencias Exactas",
    12: "Ciencias Exactas",
    3: "Ciencias de la Salud",
    13: "Ciencias de la Salud",
    4: "Arte y Creatividad",
    14: "Arte y Creatividad",
    5: "Humanidades y Sociedad",
    15: "Humanidades y Sociedad",
    6: "Administración y Negocios",
    16: "Administración y Negocios",
    7: "Ciencias Naturales y Agro",
    17: "Ciencias Naturales y Agro",
    8: "Comunicación y Medios",
    18: "Comunicación y Medios",
    9: "Educación y Pedagogía",
    19: "Educación y Pedagogía",
    10: "Seguridad y Defensa",
    20: "Seguridad y Defensa",
}

AREAS_INICIALES = [
    "Tecnología e Innovación",
    "Ciencias Exactas",
    "Ciencias de la Salud",
    "Arte y Creatividad",
    "Humanidades y Sociedad",
    "Administración y Negocios",
    "Ciencias Naturales y Agro",
    "Comunicación y Medios",
    "Educación y Pedagogía",
    "Seguridad y Defensa",
]

CATALOGO_CARRERAS_POR_AREA = {
    "Tecnología e Innovación": [
        {"nombre_carrera": "Ingeniería de Software", "universidad": "Escuela Politécnica Nacional", "provincia": "Pichincha", "modalidad": "Presencial", "puntaje_afinidad": 95},
        {"nombre_carrera": "Ciencias de la Computación", "universidad": "Universidad Central del Ecuador", "provincia": "Pichincha", "modalidad": "Presencial", "puntaje_afinidad": 92},
        {"nombre_carrera": "Tecnologías de la Información", "universidad": "Universidad Estatal de Milagro", "provincia": "Guayas", "modalidad": "En línea", "puntaje_afinidad": 88},
    ],
    "Ciencias Exactas": [
        {"nombre_carrera": "Matemática Aplicada", "universidad": "Escuela Politécnica Nacional", "provincia": "Pichincha", "modalidad": "Presencial", "puntaje_afinidad": 94},
        {"nombre_carrera": "Física", "universidad": "Universidad Central del Ecuador", "provincia": "Pichincha", "modalidad": "Presencial", "puntaje_afinidad": 89},
    ],
    "Ciencias de la Salud": [
        {"nombre_carrera": "Medicina", "universidad": "Universidad Técnica de Machala", "provincia": "El Oro", "modalidad": "Presencial", "puntaje_afinidad": 96},
        {"nombre_carrera": "Enfermería", "universidad": "Universidad Central del Ecuador", "provincia": "Pichincha", "modalidad": "Presencial", "puntaje_afinidad": 90},
    ],
    "Arte y Creatividad": [
        {"nombre_carrera": "Artes Visuales", "universidad": "Universidad de las Artes", "provincia": "Guayas", "modalidad": "Presencial", "puntaje_afinidad": 93},
        {"nombre_carrera": "Diseño Gráfico", "universidad": "Universidad Técnica de Ambato", "provincia": "Tungurahua", "modalidad": "Presencial", "puntaje_afinidad": 88},
    ],
    "Humanidades y Sociedad": [
        {"nombre_carrera": "Derecho", "universidad": "Universidad Central del Ecuador", "provincia": "Pichincha", "modalidad": "Presencial", "puntaje_afinidad": 91},
        {"nombre_carrera": "Sociología", "universidad": "Universidad de Cuenca", "provincia": "Azuay", "modalidad": "Presencial", "puntaje_afinidad": 86},
    ],
    "Administración y Negocios": [
        {"nombre_carrera": "Administración de Empresas", "universidad": "Universidad Central del Ecuador", "provincia": "Pichincha", "modalidad": "Presencial", "puntaje_afinidad": 92},
        {"nombre_carrera": "Contabilidad y Auditoría", "universidad": "Universidad de Guayaquil", "provincia": "Guayas", "modalidad": "Presencial", "puntaje_afinidad": 87},
    ],
    "Ciencias Naturales y Agro": [
        {"nombre_carrera": "Agronomía", "universidad": "Universidad Técnica de Machala", "provincia": "El Oro", "modalidad": "Presencial", "puntaje_afinidad": 90},
        {"nombre_carrera": "Biotecnología", "universidad": "Escuela Superior Politécnica del Litoral", "provincia": "Guayas", "modalidad": "Presencial", "puntaje_afinidad": 94},
    ],
    "Comunicación y Medios": [
        {"nombre_carrera": "Comunicación Social", "universidad": "Universidad Central del Ecuador", "provincia": "Pichincha", "modalidad": "Presencial", "puntaje_afinidad": 90},
    ],
    "Educación y Pedagogía": [
        {"nombre_carrera": "Pedagogía de las Ciencias Experimentales", "universidad": "Universidad Nacional de Educación", "provincia": "Cañar", "modalidad": "Presencial", "puntaje_afinidad": 92},
    ],
    "Seguridad y Defensa": [
        {"nombre_carrera": "Criminalística y Ciencias Forenses", "universidad": "Universidad de Guayaquil", "provincia": "Guayas", "modalidad": "Presencial", "puntaje_afinidad": 91},
    ],
}


def validar_respuestas_cuestionario(respuestas: Dict[str, Any]) -> None:
    """
    Valida estrictamente que el diccionario contenga exactamente las claves '1' a '20'
    y que todos los valores sean enteros entre 0 y 4 (escala Likert).
    Lanza ValueError si faltan preguntas, existen preguntas desconocidas o valores fuera de rango.
    """
    if not isinstance(respuestas, dict):
        raise ValueError("El cuerpo de respuestas debe ser un objeto diccionario.")

    claves_esperadas = {str(i) for i in range(1, 21)}
    claves_recibidas = set(respuestas.keys())

    if claves_recibidas != claves_esperadas:
        faltantes = sorted(list(claves_esperadas - claves_recibidas), key=lambda x: int(x) if x.isdigit() else 999)
        sobrantes = sorted(list(claves_recibidas - claves_esperadas))
        detalles = []
        if faltantes:
            detalles.append(f"Preguntas faltantes: {faltantes}")
        if sobrantes:
            detalles.append(f"Preguntas no permitidas o desconocidas: {sobrantes}")
        raise ValueError(
            f"Cuestionario inválido. Debe responder exactamente las 20 preguntas del test (claves '1' a '20'). {'; '.join(detalles)}"
        )

    fuera_de_rango = []
    for k, v in respuestas.items():
        if isinstance(v, bool) or not isinstance(v, int) or v < 0 or v > 4:
            fuera_de_rango.append(f"Pregunta {k}: valor {repr(v)} fuera de rango (debe ser entero entre 0 y 4)")

    if fuera_de_rango:
        raise ValueError(
            f"Valores de respuesta fuera de rango Likert (0 a 4): {'; '.join(fuera_de_rango)}"
        )


def calcular_puntuaciones_vocacionales(respuestas: Dict[str, int]) -> Dict[str, Any]:
    """
    Procesa las 20 respuestas Likert y calcula puntuaciones acumuladas para las 10 áreas.
    Aplica validación estricta sin recortes silenciosos de valores.
    """
    validar_respuestas_cuestionario(respuestas)
    puntuaciones = {area: 0 for area in AREAS_INICIALES}

    for str_id, valor in respuestas.items():
        q_id = int(str_id)
        area = PREGUNTAS_A_AREAS[q_id]
        puntuaciones[area] += valor

    max_puntos = max(puntuaciones.values()) if puntuaciones else 0
    todas_cero = all(v == 0 for v in puntuaciones.values())

    if todas_cero:
        return {
            "puntuaciones": puntuaciones,
            "area_predominante": "Indefinida (Todas en cero)",
            "es_empate": False,
            "areas_empatadas": [],
            "todas_cero": True,
            "mensaje_resultado": "No se registraron intereses afines (todas las respuestas en 0). Se recomienda asesoría vocacional personalizada.",
        }

    candidatas = [area for area, pts in puntuaciones.items() if pts == max_puntos]
    es_empate = len(candidatas) > 1

    return {
        "puntuaciones": puntuaciones,
        "area_predominante": candidatas[0],
        "es_empate": es_empate,
        "areas_empatadas": candidatas if es_empate else [],
        "todas_cero": False,
        "mensaje_resultado": f"Afinidad predominante en {candidatas[0]} con {max_puntos} de 8 puntos posibles."
    }


def recomendar_carreras(area_predominante: str, provincia: str = "Pichincha", todas_cero: bool = False) -> List[Dict[str, Any]]:
    """Genera lista de carreras pertinentes a partir del área predominante."""
    if todas_cero or area_predominante not in CATALOGO_CARRERAS_POR_AREA:
        return []

    carreras = CATALOGO_CARRERAS_POR_AREA.get(area_predominante, [])
    # Reordenar priorizando la provincia de residencia si coincide
    carreras_ordenadas = sorted(
        carreras,
        key=lambda c: (c["provincia"] != provincia, -c["puntaje_afinidad"])
    )
    return carreras_ordenadas


def generar_recomendaciones_pedagogicas(area_predominante: str, es_empate: bool = False, areas_empatadas: List[str] = None) -> Dict[str, str]:
    """Genera texto orientativo de apoyo al estudiante."""
    if es_empate and areas_empatadas:
        nombres = ", ".join(areas_empatadas)
        return {
            "enfoque_principal": f"Presentas un perfil vocacional equilibrado con afinidad compartida en: {nombres}.",
            "sugerencia_exploratoria": "Revisa los perfiles de egreso de cada una de estas áreas para contrastar tus expectativas con la práctica profesional."
        }

    return {
        "enfoque_principal": f"Tu perfil muestra una marcada inclinación hacia el campo de {area_predominante}.",
        "sugerencia_exploratoria": "Explora las mallas curriculares y convenios de prácticas de las universidades públicas recomendadas."
    }
