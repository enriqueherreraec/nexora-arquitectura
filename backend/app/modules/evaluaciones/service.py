import math
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session

from app.modules.cuestionario.data import (
    PREGUNTAS_VOCACIONALES,
    AREAS_VOCACIONALES_10,
    PREGUNTAS_POR_ID,
)
from app.modules.catalogo.data import OFERTA_CARRERAS, COORDENADAS_PROVINCIAS
from app.modules.catalogo.models import CarreraCatalogo
from app.modules.catalogo.utils import remover_tildes


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcula la distancia geodésica en kilómetros entre dos coordenadas (Haversine)."""
    R = 6371.0  # Radio terrestre en km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 1)


def estimar_tiempo_traslado(distancia_km: float, medio_transporte: str = "Transporte público", es_en_linea: bool = False) -> str:
    """Calcula tiempo referencial de viaje o describe la modalidad virtual."""
    if es_en_linea:
        return "Modalidad 100% En Línea • Campus virtual sin traslado presencial diario"
    if distancia_km < 15:
        return "~20 - 35 min (Transporte urbano local)"
    elif distancia_km < 40:
        return "~45 - 60 min (Ruta cantonal/interurbana)"
    elif distancia_km < 100:
        return f"~1.5 - 2 horas ({medio_transporte})"
    elif distancia_km < 250:
        return f"~3 - 4.5 horas (Ruta interprovincial)"
    else:
        return f"~5+ horas ({distancia_km} km) • Sugerida modalidad En Línea o Residencia"


# Importar agrupación canónica de 20 preguntas (2 preguntas por área, versión 3.0)
from app.modules.cuestionario.data import PREGUNTAS_POR_AREA as PREGUNTAS_POR_AREA_V3

# Mapeo histórico para evaluaciones previas de 30 reactivos (versión 2.0)
PREGUNTAS_POR_AREA_V2: Dict[str, List[int]] = {
    "Ingeniería y Tecnología": [1, 2, 3],
    "Ciencias de la Salud": [4, 5, 6],
    "Ciencias Administrativas y Económicas": [7, 8, 9],
    "Derecho y Ciencias Sociales": [10, 11, 12],
    "Educación y Pedagogía": [13, 14, 15],
    "Ciencias Agropecuarias y Veterinaria": [16, 17, 18],
    "Ciencias Naturales y Matemáticas": [19, 20, 21],
    "Artes y Humanidades": [22, 23, 24],
    "Arquitectura y Diseño": [25, 26, 27],
    "Comunicación": [28, 29, 30],
}

# Alias por defecto para versión actual 3.0
PREGUNTAS_POR_AREA = PREGUNTAS_POR_AREA_V3


def calcular_puntuaciones_vocacionales(
    respuestas: Dict[Any, Any],
    version: Optional[str] = None
) -> Dict[str, Any]:
    """
    Calcula el puntaje de afinidad vocacional (0 a 100%) para cada una de las 10 áreas.
    
    Versión 3.0 (20 preguntas, 2 por área):
      Índice de interés = (suma de las dos respuestas del área / 8) × 100
      Máximo por área = 8 puntos.
      
    Versión 2.0 histórica (30 preguntas, 3 por área):
      Afinidad del área = (suma de las tres respuestas / 12) × 100
      Máximo por área = 12 puntos.
      
    Identifica empates legítimos y casos de puntuación cero generalizada sin asignar ganadoras arbitrarias.
    """
    respuestas_normalizadas: Dict[int, int] = {}
    for k, v in respuestas.items():
        try:
            qid = int(k)
            val = max(0, min(4, int(v)))
            respuestas_normalizadas[qid] = val
        except (ValueError, TypeError):
            continue

    # Detectar versión: si se especifica explícitamente, o si hay respuestas con IDs > 20 o más de 20 respuestas
    max_id = max(respuestas_normalizadas.keys(), default=0)
    total_respuestas = len(respuestas_normalizadas)
    es_v2 = (version == "2.0-10areas") or (version is None and (max_id > 20 or total_respuestas > 20))

    if es_v2:
        mapping = PREGUNTAS_POR_AREA_V2
        divisor = 12.0
        max_puntos_posibles = 12
        version_detectada = "2.0-10areas"
    else:
        mapping = PREGUNTAS_POR_AREA_V3
        divisor = 8.0
        max_puntos_posibles = 8
        version_detectada = "3.0-20preguntas"

    afinidad_porcentajes: Dict[str, int] = {}
    puntos_brutos: Dict[str, int] = {}

    for area in AREAS_VOCACIONALES_10:
        q_ids = mapping.get(area, [])
        suma_area = sum(respuestas_normalizadas.get(qid, 0) for qid in q_ids)
        puntos_brutos[area] = suma_area
        # Fórmula: (suma respuestas / divisor) * 100
        afinidad = round((suma_area / divisor) * 100)
        afinidad_porcentajes[area] = min(100, max(0, afinidad))

    # Ordenar áreas de mayor a menor afinidad
    areas_ordenadas = sorted(
        afinidad_porcentajes.items(),
        key=lambda item: item[1],
        reverse=True
    )

    max_puntos = max(puntos_brutos.values()) if puntos_brutos else 0
    max_afinidad = max(afinidad_porcentajes.values()) if afinidad_porcentajes else 0

    # Comprobación de todas en cero
    todas_cero = (max_puntos == 0)

    if todas_cero:
        area_predominante = "Sin preferencia identificada"
        es_empate = False
        areas_empatadas = []
        mensaje_resultado = (
            "Todas las actividades recibieron puntuación de cero ('Nada'). "
            "Todavía no existe una preferencia identificada. "
            "Te recomendamos revisar las respuestas para identificar tus intereses vocacionales."
        )
    else:
        # Detección de empates legítimos en el primer lugar
        top_areas = [area for area, af in afinidad_porcentajes.items() if af == max_afinidad and af > 0]
        es_empate = len(top_areas) > 1
        areas_empatadas = top_areas if es_empate else []
        if es_empate:
            if len(top_areas) > 3:
                area_predominante = f"Empate: {top_areas[0]} y otras {len(top_areas) - 1} áreas"
            else:
                area_predominante = " / ".join(top_areas)
            mensaje_resultado = f"Tienes una alta afinidad compartida del {max_afinidad}% entre: {', '.join(top_areas)}."
        else:
            area_predominante = top_areas[0]
            mensaje_resultado = f"Tu área con mayor afinidad vocacional declarada es {area_predominante} ({max_afinidad}%)."

    return {
        "puntuaciones": afinidad_porcentajes,
        "puntos_brutos": puntos_brutos,
        "ranking_areas": areas_ordenadas,
        "area_predominante": area_predominante,
        "es_empate": es_empate,
        "areas_empatadas": areas_empatadas,
        "todas_cero": todas_cero,
        "mensaje_resultado": mensaje_resultado,
        "max_afinidad": max_afinidad,
        "max_puntos_por_area": max_puntos_posibles,
        "version_cuestionario": version_detectada,
    }


# Coordenadas aproximadas de cantones y ciudades clave para cálculo de cercanía
COORDENADAS_CIUDADES: Dict[str, tuple] = {
    "huaquillas": (-3.4756, -80.2289),
    "machala": (-3.2586, -79.9553),
    "pasaje": (-3.3262, -79.8073),
    "santa rosa": (-3.4489, -79.9594),
    "arenillas": (-3.5519, -80.0664),
    "zaruma": (-3.6917, -79.6111),
    "piñas": (-3.6806, -79.6806),
    "pinas": (-3.6806, -79.6806),
    "milagro": (-2.1340, -79.5942),
    "guayaquil": (-2.1818, -79.8978),
    "duran": (-2.1706, -79.8450),
    "daule": (-1.8622, -79.9778),
    "quito": (-0.2106, -78.4891),
    "distrito metropolitano de quito": (-0.2106, -78.4891),
    "rumiñahui": (-0.3134, -78.4431),
    "ruminahui": (-0.3134, -78.4431),
    "sangolquí": (-0.3134, -78.4431),
    "sangolqui": (-0.3134, -78.4431),
    "cuenca": (-2.9069, -79.0068),
    "loja": (-4.0328, -79.1983),
    "ambato": (-1.2662, -78.6301),
    "riobamba": (-1.6644, -78.6548),
    "ibarra": (0.3582, -78.1158),
    "portoviejo": (-1.0544, -80.4544),
    "manta": (-0.9525, -80.7483),
    "babahoyo": (-1.8021, -79.5344),
    "quevedo": (-1.0286, -79.4635),
    "latacunga": (-0.9328, -78.6148),
    "puyo": (-1.4883, -77.9942),
    "tena": (-0.9497, -77.8631),
    "tulcán": (0.8123, -77.7174),
    "tulcan": (0.8123, -77.7174),
    "azogues": (-2.7424, -78.8475),
    "guaranda": (-1.5912, -79.0044),
    "santo domingo": (-0.2530, -79.1754),
    "santa elena": (-2.2262, -80.8587),
    "salinas": (-2.2200, -80.9587),
    "nueva loja": (0.0847, -76.8828),
    "el coca": (-0.4658, -76.9877),
    "macas": (-2.3087, -78.1189),
    "zamora": (-4.0664, -78.9564),
}


def recomendar_carreras(
    puntuaciones_areas: Dict[str, int],
    provincia_origen: str = "Pichincha",
    ciudad_origen: str = "Quito",
    medio_transporte: str = "Transporte público",
    modalidad_preferida: str = "Presencial",
    respuestas: Optional[Dict[Any, Any]] = None,
    db: Optional[Session] = None,
) -> List[Dict[str, Any]]:
    """
    Algoritmo de recomendación oficial Nexora (10 áreas vocacionales):
    1. Filtra primero las carreras de las áreas de mayor interés (excluye áreas no pertinentes).
    2. Considera diferencias específicas dentro de una misma área (ej. rehabilitación vs medicina clínica).
    3. Para modalidad 'En Línea', prioriza ofertas virtuales (ej. UNEMI TI En Línea).
    4. Prioriza cercanía entre opciones pertinentes y conserva alternativas de otras universidades.
    5. Solo recomienda ofertas de Tercer Nivel (Grado) y vigentes.
    """
    sorted_areas = sorted(puntuaciones_areas.items(), key=lambda x: x[1], reverse=True)
    if not sorted_areas or sorted_areas[0][1] == 0:
        return []

    top_score = sorted_areas[0][1]

    # Identificar áreas relevantes (top score y aquellas >= 50% y a no más de 20 pts del máximo)
    areas_relevantes = {a for a, s in sorted_areas if s == top_score and s > 0}
    for area, score in sorted_areas:
        if score >= 50 and (top_score - score) <= 20:
            areas_relevantes.add(area)

    # Coordenadas de partida del estudiante
    ciudad_norm = remover_tildes(ciudad_origen or "")
    if ciudad_norm in COORDENADAS_CIUDADES:
        origen_lat, origen_lon = COORDENADAS_CIUDADES[ciudad_norm]
    else:
        prov_match = None
        for prov_key, coords in COORDENADAS_PROVINCIAS.items():
            if remover_tildes(prov_key) in remover_tildes(provincia_origen or ""):
                prov_match = coords
                break
        origen_lat, origen_lon = prov_match if prov_match else (-0.2106, -78.4891)

    pref_norm = remover_tildes(modalidad_preferida or "")
    pref_es_en_linea = ("linea" in pref_norm or "virtual" in pref_norm or "online" in pref_norm)

    resp_dict = {}
    if respuestas:
        for k, v in respuestas.items():
            try:
                resp_dict[int(k)] = int(v)
            except (ValueError, TypeError):
                pass

    # Obtener candidatos desde PostgreSQL
    candidatos_base: List[Dict[str, Any]] = []

    if db is not None:
        try:
            carreras_db = db.query(CarreraCatalogo).filter(
                CarreraCatalogo.es_tercer_nivel == True,
                CarreraCatalogo.es_vigente == True
            ).all()

            for c in carreras_db:
                # Comprobar pertenencia a alguna de las áreas relevantes
                c_areas = c.areas_vocacionales or [c.area_vocacional]
                if any(a in areas_relevantes for a in c_areas) or c.area_vocacional in areas_relevantes:
                    candidatos_base.append(c.to_dict())
        except Exception:
            candidatos_base = []

    if not candidatos_base:
        # Fallback si no hay BD conectada (ej. pruebas en memoria o inicialización)
        for c in OFERTA_CARRERAS:
            c_area = c.get("area_vocacional", "")
            c_area_norm = c_area.replace("Ingenierías y Tecnologías", "Ingeniería y Tecnología")
            if c_area in areas_relevantes or c_area_norm in areas_relevantes:
                c_copy = dict(c)
                c_copy["area_vocacional"] = c_area_norm
                candidatos_base.append(c_copy)

    carreras_procesadas = []

    for carrera in candidatos_base:
        # Calcular afinidad correspondiente a la carrera
        c_areas = carrera.get("areas_vocacionales") or [carrera.get("area_vocacional", "")]
        afinidad_carrera = max([puntuaciones_areas.get(a, 0) for a in c_areas] or [30])

        modalidad_carrera = carrera.get("modalidad", "Presencial")
        mod_norm = remover_tildes(modalidad_carrera)
        es_en_linea = ("linea" in mod_norm or "virtual" in mod_norm)

        dist_km = haversine_distance(
            origen_lat, origen_lon,
            carrera.get("lat", -0.2106), carrera.get("lon", -78.4891)
        )
        tiempo_estimado = estimar_tiempo_traslado(dist_km, medio_transporte, es_en_linea=es_en_linea)

        es_misma_prov = (
            remover_tildes(carrera.get("provincia", "")) == remover_tildes(provincia_origen or "")
        )
        ciudad_display = ciudad_origen if ciudad_origen else provincia_origen
        nom_carr_norm = remover_tildes(carrera.get("nombre", ""))

        # Nuance pedagógico intra-área según respuestas específicas
        bono_subenfoque = 0
        if "Ciencias de la Salud" in c_areas:
            ans_p3 = resp_dict.get(3, 0)  # v3: Cuerpo humano, enfermedades y prevención
            ans_p4 = resp_dict.get(4, 0)  # v3: Atención a enfermos y cuidados / v2: Medicina
            ans_p5 = resp_dict.get(5, 0)  # v2: Laboratorio clínico
            ans_p6 = resp_dict.get(6, 0)  # v2: Fisioterapia y rehabilitación
            
            # Bonos para preguntas v3 (Q3 y Q4)
            if ans_p3 >= 3 and any(k in nom_carr_norm for k in ['medicina', 'bioquimica', 'laboratorio', 'farmacia', 'nutricion']):
                bono_subenfoque += 480
            if ans_p4 >= 3 and any(k in nom_carr_norm for k in ['enfermeria', 'obstetricia', 'terapia', 'fisioterapia']):
                bono_subenfoque += 450

            # Bonos legacy para preguntas v2
            if ans_p6 >= 3 and any(k in nom_carr_norm for k in ['fisioterapia', 'terapia fisica', 'terapia ocupacional', 'kinesiologia', 'fonoaudiologia']):
                bono_subenfoque += 500
            if ans_p4 >= 3 and 'medicina' in nom_carr_norm and 'veterinaria' not in nom_carr_norm:
                bono_subenfoque += 480
            if ans_p5 >= 3 and any(k in nom_carr_norm for k in ['laboratorio', 'bioquimica', 'farmacia']):
                bono_subenfoque += 400

        if "Ingeniería y Tecnología" in c_areas:
            ans_p1 = resp_dict.get(1, 0)  # v3 y v2: Software, apps, web, TI
            ans_p2 = resp_dict.get(2, 0)  # v3: Máquinas y circuitos / v2: Circuitos
            ans_p3 = resp_dict.get(3, 0)  # v2: Obras civiles
            if ans_p1 >= 3 and any(k in nom_carr_norm for k in ['software', 'tecnologias de la informacion', 'computacion', 'sistemas', 'datos']):
                bono_subenfoque += 500
            elif ans_p2 >= 3 and any(k in nom_carr_norm for k in ['electronica', 'electricidad', 'telecomunicaciones', 'mecatronica', 'mecanica', 'industrial']):
                bono_subenfoque += 420
            elif ans_p3 >= 3 and any(k in nom_carr_norm for k in ['civil', 'mecanica', 'estructuras']):
                bono_subenfoque += 400

        # Bonificación por institución universitaria
        es_universidad = (carrera.get("tipo_ies") == "UNIVERSIDAD" or "universidad" in remover_tildes(carrera.get("institucion", "")))
        bono_universidad = 1500 if es_universidad else 0

        # Modalidad y distancia
        bono_modalidad = 0
        if pref_es_en_linea and es_en_linea:
            bono_modalidad = 600
            dist_penalidad = 0
        elif not pref_es_en_linea and not es_en_linea:
            bono_modalidad = 150
            dist_penalidad = min(dist_km, 600)
        else:
            dist_penalidad = min(dist_km, 600)

        # Bono local para presencial en la misma provincia
        bono_local = 400 if (es_misma_prov and not pref_es_en_linea) else 0

        score_ranking = (afinidad_carrera * 1000) + bono_universidad + bono_subenfoque + bono_modalidad + bono_local - dist_penalidad

        # Explicación pedagógica personalizada
        area_nombre_display = carrera.get("area_vocacional", "tu área de interés")
        facultad_texto = f" en la {carrera['facultad']}" if carrera.get('facultad') and 'No verificada' not in carrera.get('facultad', '') else ""

        if es_en_linea:
            explicacion = (
                f"Sugerida por tu afinidad del {afinidad_carrera}% hacia '{area_nombre_display}' y tu preferencia por modalidad En Línea. "
                f"Impartida en campus virtual por la {carrera['institucion']}{facultad_texto} ({carrera['provincia']}), "
                f"permitiéndote cursar tu carrera universitaria oficial sin requerir traslado geográfico diario."
            )
        elif es_misma_prov:
            explicacion = (
                f"Sugerida por tu alta afinidad del {afinidad_carrera}% hacia '{area_nombre_display}'. "
                f"Es la opción universitaria pública más cercana a tu residencia en {ciudad_display} ({dist_km} km), "
                f"impartida por la {carrera['institucion']}{facultad_texto} en tu provincia de origen ({carrera['provincia']})."
            )
        else:
            explicacion = (
                f"Alternativa pública afín en {carrera['ciudad']} ({dist_km} km) con {afinidad_carrera}% de afinidad vocacional declarada. "
                f"Brinda una opción destacada en la {carrera['institucion']}{facultad_texto} para tu formación superior fuera de {provincia_origen}."
            )

        item = dict(carrera)
        item["afinidad_vocacional"] = afinidad_carrera
        item["distancia_km"] = dist_km
        item["tiempo_traslado"] = tiempo_estimado
        item["es_misma_provincia"] = es_misma_prov
        item["explicacion"] = explicacion
        item["_score_ranking"] = score_ranking

        carreras_procesadas.append(item)

    carreras_procesadas.sort(key=lambda c: c["_score_ranking"], reverse=True)

    # Diversificación institucional: máximo 2 ofertas por universidad en el top
    carreras_finales = []
    conteo_ies: Dict[str, int] = {}

    for c in carreras_procesadas:
        ies = c.get("siglas") or c.get("institucion")
        if conteo_ies.get(ies, 0) < 2:
            conteo_ies[ies] = conteo_ies.get(ies, 0) + 1
            c_clean = dict(c)
            c_clean.pop("_score_ranking", None)
            carreras_finales.append(c_clean)
            if len(carreras_finales) >= 12:
                break

    if len(carreras_finales) < 6:
        ids_incluidos = {c["id"] for c in carreras_finales}
        for c in carreras_procesadas:
            if c["id"] not in ids_incluidos:
                c_clean = dict(c)
                c_clean.pop("_score_ranking", None)
                carreras_finales.append(c_clean)
                if len(carreras_finales) >= 12:
                    break

    return carreras_finales


def generar_recomendaciones_pedagogicas(area_top: str, afinidad_top: int, es_empate: bool = False, areas_empatadas: Optional[List[str]] = None) -> List[str]:
    """Genera recomendaciones pedagógicas estructuradas para el informe."""
    if es_empate and areas_empatadas:
        texto_areas = " y ".join(areas_empatadas)
        consejo_area = (
            f"Presentas un empate en tu índice de interés declarado ({afinidad_top}%) entre {texto_areas}. "
            f"Esta multidisciplinariedad te permite explorar carreras transversales o comparar sus mallas curriculares con detalle."
        )
    else:
        consejo_area = (
            f"Tu perfil vocacional muestra una afinidad predominante del {afinidad_top}% hacia '{area_top}'. "
            f"Te recomendamos revisar las asignaturas y campos ocupacionales de las universidades sugeridas."
        )

    consejos = [
        consejo_area,
        "El índice vocacional refleja tus intereses personales declarados y no una medida validada de aptitud, probabilidad de ingreso ni corte de admisión asegurado.",
        "Si debes trasladarte a otra provincia, evalúa opciones de becas de residencia o carreras en modalidad en línea/híbrida para optimizar tu tiempo y recursos.",
        "Consulta oportunamente los cronogramas oficiales de admisión y requisitos específicos administrados por las universidades públicas del Ecuador."
    ]
    return consejos
