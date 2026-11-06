"""
Banco oficial de 20 reactivos del cuestionario vocacional Nexora (Versión 3.0).
Organizado en 10 áreas vocacionales con exactamente 2 preguntas por área.
Presentado en 4 páginas de 5 preguntas intercaladas para evitar preguntas consecutivas de la misma área.
Escala Likert: Nada (0), Poco (1), Algo (2), Bastante (3), Mucho (4).
Máximo por área: 8 puntos.
"""

INSTRUCCIONES_ESTUDIANTE = (
    "Imagina que puedes aprender a realizar cada actividad, aunque todavía no tengas experiencia, "
    "indica cuánto te gustaría participar, no hay respuestas correctas o incorrectas, "
    "responde según tus intereses personales y no según lo que otras personas esperan de ti."
)

OPCIONES_LIKERT = [
    {
        "valor": 0,
        "etiqueta": "Nada",
        "descripcion": "No me gustaría realizar esta actividad."
    },
    {
        "valor": 1,
        "etiqueta": "Poco",
        "descripcion": "Me interesa poco."
    },
    {
        "valor": 2,
        "etiqueta": "Algo",
        "descripcion": "Me interesa, pero todavía tengo dudas."
    },
    {
        "valor": 3,
        "etiqueta": "Bastante",
        "descripcion": "Me gustaría aprender a realizarla."
    },
    {
        "valor": 4,
        "etiqueta": "Mucho",
        "descripcion": "Me entusiasma aprenderla y dedicarle tiempo."
    },
]

AREAS_VOCACIONALES_10 = [
    "Ingeniería y Tecnología",
    "Ciencias de la Salud",
    "Ciencias Administrativas y Económicas",
    "Derecho y Ciencias Sociales",
    "Educación y Pedagogía",
    "Ciencias Agropecuarias y Veterinaria",
    "Ciencias Naturales y Matemáticas",
    "Artes y Humanidades",
    "Arquitectura y Diseño",
    "Comunicación",
]

# Diccionario canónico de las 20 preguntas con su ID, área interna y ejemplo explicativo
PREGUNTAS_POR_ID = {
    # 1. Ingeniería y Tecnología
    1: {
        "id": 1,
        "area": "Ingeniería y Tecnología",
        "area_num": 1,
        "pregunta": "¿Te gustaría aprender a crear aplicaciones o páginas web que ayuden a las personas a resolver problemas de su vida diaria?",
        "ejemplo": "Diseñar una aplicación para pedir citas médicas o crear una plataforma web para conectar productores locales con compradores.",
        "enfoque": "software_web",
    },
    2: {
        "id": 2,
        "area": "Ingeniería y Tecnología",
        "area_num": 1,
        "pregunta": "¿Te llama la atención descubrir cómo funcionan las máquinas y los aparatos electrónicos, y aprender a identificar sus fallas?",
        "ejemplo": "Abrir un electrodoméstico o dispositivo, medir su circuito con herramientas y sustituir componentes para que vuelva a funcionar.",
        "enfoque": "hardware_maquinas",
    },

    # 2. Ciencias de la Salud
    3: {
        "id": 3,
        "area": "Ciencias de la Salud",
        "area_num": 2,
        "pregunta": "¿Sientes curiosidad por conocer cómo funciona el cuerpo humano, por qué aparecen las enfermedades y qué podemos hacer para prevenirlas?",
        "ejemplo": "Comprender cómo viajan los nutrientes en la sangre, por qué sube la presión arterial y qué hábitos previenen padecimientos comunes.",
        "enfoque": "medicina_prevencion",
    },
    4: {
        "id": 4,
        "area": "Ciencias de la Salud",
        "area_num": 2,
        "pregunta": "¿Te interesa aprender a atender a personas enfermas y conocer los cuidados que necesitan para recuperar su salud?",
        "ejemplo": "Acompañar a pacientes en su tratamiento, curar lesiones con protocolos higiénicos y suministrar cuidados específicos según las indicaciones médicas.",
        "enfoque": "cuidado_enfermeria",
    },

    # 3. Ciencias Administrativas y Económicas
    5: {
        "id": 5,
        "area": "Ciencias Administrativas y Económicas",
        "area_num": 3,
        "pregunta": "¿Te gustaría aprender a dirigir un negocio, organizar el trabajo de sus empleados y decidir cómo utilizar sus recursos?",
        "ejemplo": "Planificar horarios de trabajo, coordinar compras de mercadería y liderar un equipo para cumplir metas comerciales.",
        "enfoque": "gestion_liderazgo",
    },
    6: {
        "id": 6,
        "area": "Ciencias Administrativas y Económicas",
        "area_num": 3,
        "pregunta": "¿Te llama la atención revisar cuánto dinero gana y gasta un negocio para comprender si obtiene ganancias o necesita hacer cambios?",
        "ejemplo": "Revisar facturas de ventas, calcular costos fijos e interpretar balances financieros para asesorar a los dueños de una empresa.",
        "enfoque": "finanzas_contabilidad",
    },

    # 4. Derecho y Ciencias Sociales
    7: {
        "id": 7,
        "area": "Derecho y Ciencias Sociales",
        "area_num": 4,
        "pregunta": "¿Te interesa conocer los derechos de las personas y aprender cómo se utilizan las leyes para resolver conflictos o situaciones injustas?",
        "ejemplo": "Interpretar artículos de una ley para proteger a un trabajador o redactar un acuerdo pacífico entre dos partes en disputa.",
        "enfoque": "derecho_justicia",
    },
    8: {
        "id": 8,
        "area": "Derecho y Ciencias Sociales",
        "area_num": 4,
        "pregunta": "¿Te gustaría comprender las causas de problemas como la pobreza o la desigualdad y conocer cómo afectan a las familias de una comunidad?",
        "ejemplo": "Levantar encuestas en un vecindario, analizar la falta de acceso a servicios básicos y proponer políticas de apoyo social.",
        "enfoque": "sociologia_comunidad",
    },

    # 5. Educación y Pedagogía
    9: {
        "id": 9,
        "area": "Educación y Pedagogía",
        "area_num": 5,
        "pregunta": "¿Disfrutarías explicar un tema a otras personas y buscar diferentes ejemplos para ayudarles cuando tienen dificultades para entenderlo?",
        "ejemplo": "Usar comparaciones con la vida diaria o dibujos sencillos para que un compañero finalmente comprenda un concepto que le parecía difícil.",
        "enfoque": "didactica_ensenanza",
    },
    10: {
        "id": 10,
        "area": "Educación y Pedagogía",
        "area_num": 5,
        "pregunta": "¿Te gustaría preparar juegos, materiales y actividades para que niños o jóvenes aprendan de una forma que puedan comprender?",
        "ejemplo": "Diseñar cartas educativas, dinámicas grupales o maquetas interactivas para una clase sobre historia o ciencia.",
        "enfoque": "materiales_infancia",
    },

    # 6. Ciencias Agropecuarias y Veterinaria
    11: {
        "id": 11,
        "area": "Ciencias Agropecuarias y Veterinaria",
        "area_num": 6,
        "pregunta": "¿Te interesa aprender a cultivar plantas, cuidar el suelo y conocer qué condiciones permiten producir alimentos de buena calidad?",
        "ejemplo": "Analizar la humedad de la tierra, aplicar abonos orgánicos y planificar cosechas de hortalizas o frutas sin pesticidas dañinos.",
        "enfoque": "agronomia_suelos",
    },
    12: {
        "id": 12,
        "area": "Ciencias Agropecuarias y Veterinaria",
        "area_num": 6,
        "pregunta": "¿Te gustaría estudiar la salud de los animales, reconocer sus enfermedades y aprender qué cuidados necesitan para recuperarse?",
        "ejemplo": "Revisar signos clínicos en mascotas o animales de granja, aplicar tratamientos preventivos y asistir en procedimientos veterinarios.",
        "enfoque": "veterinaria_zootecnia",
    },

    # 7. Ciencias Naturales y Matemáticas
    13: {
        "id": 13,
        "area": "Ciencias Naturales y Matemáticas",
        "area_num": 7,
        "pregunta": "¿Sientes curiosidad por hacer experimentos, observar sus resultados y buscar explicaciones sobre cómo funcionan los fenómenos de la naturaleza?",
        "ejemplo": "Mezclar sustancias químicas bajo condiciones controladas o utilizar un microscopio para observar células vivas en agua estancada.",
        "enfoque": "laboratorio_ciencias",
    },
    14: {
        "id": 14,
        "area": "Ciencias Naturales y Matemáticas",
        "area_num": 7,
        "pregunta": "¿Disfrutarías resolver problemas con números y comparar datos para descubrir patrones o explicar por qué cambian ciertos resultados?",
        "ejemplo": "Construir tablas de datos estadísticos sobre el clima o usar fórmulas matemáticas para predecir cuándo ocurrirá un evento natural.",
        "enfoque": "matematicas_estadistica",
    },

    # 8. Artes y Humanidades
    15: {
        "id": 15,
        "area": "Artes y Humanidades",
        "area_num": 8,
        "pregunta": "¿Te gustaría expresar tus ideas o emociones mediante música, dibujos, pinturas, danza o teatro, y desarrollar tu propio estilo?",
        "ejemplo": "Componer una canción en un instrumento, pintar un mural expresivo o interpretar un personaje en una obra de teatro.",
        "enfoque": "expresion_artistica",
    },
    16: {
        "id": 16,
        "area": "Artes y Humanidades",
        "area_num": 8,
        "pregunta": "¿Te interesa leer historias y conocer cómo viven y piensan personas de otras épocas o culturas para comprender sus experiencias?",
        "ejemplo": "Leer novelas históricas o crónicas antiguas para reflexionar sobre las costumbres, creencias y luchas de civilizaciones pasadas.",
        "enfoque": "literatura_historia",
    },

    # 9. Arquitectura y Diseño
    17: {
        "id": 17,
        "area": "Arquitectura y Diseño",
        "area_num": 9,
        "pregunta": "¿Te gustaría dibujar planos y diseñar casas o edificios, con atención a la distribución de los espacios y las necesidades de sus usuarios?",
        "ejemplo": "Crear planos a escala aprovechando la entrada de luz solar, ventilación natural y distribución cómoda de los ambientes.",
        "enfoque": "arquitectura_planos",
    },
    18: {
        "id": 18,
        "area": "Arquitectura y Diseño",
        "area_num": 9,
        "pregunta": "¿Te atrae diseñar objetos, carteles o imágenes, y elegir sus formas y colores para que sean útiles y fáciles de entender?",
        "ejemplo": "Diseñar el logotipo y los carteles visuales de un evento o proyectar un mueble funcional que ocupe poco espacio.",
        "enfoque": "diseno_grafico_producto",
    },

    # 10. Comunicación
    19: {
        "id": 19,
        "area": "Comunicación",
        "area_num": 10,
        "pregunta": "¿Te gustaría investigar una noticia, entrevistar a las personas involucradas y revisar la información antes de compartir lo que ocurrió?",
        "ejemplo": "Indagar sobre un acontecimiento de tu ciudad, contrastar testimonios y redactar una nota informativa objetiva y clara.",
        "enfoque": "periodismo_investigacion",
    },
    20: {
        "id": 20,
        "area": "Comunicación",
        "area_num": 10,
        "pregunta": "¿Disfrutarías crear videos, pódcasts o publicaciones para explicar un tema de forma clara y captar la atención de tu público?",
        "ejemplo": "Grabar un episodio de audio o un video corto para redes sociales con guion atractivo, música y edición limpia.",
        "enfoque": "medios_digitales_podcast",
    },
}

# Organización oficial en 4 páginas de 5 preguntas intercaladas:
# - Página 1: preguntas 1, 3, 5, 7 y 9
# - Página 2: preguntas 11, 13, 15, 17 y 19
# - Página 3: preguntas 2, 4, 6, 8 y 10
# - Página 4: preguntas 12, 14, 16, 18 y 20
PAGINAS_PREGUNTAS_IDS = [
    [1, 3, 5, 7, 9],       # Página 1
    [11, 13, 15, 17, 19],  # Página 2
    [2, 4, 6, 8, 10],      # Página 3
    [12, 14, 16, 18, 20],  # Página 4
]

# Orden de presentación consecutivo (de 1 a 20)
ORDEN_PRESENTACION_IDS = [
    1, 3, 5, 7, 9,
    11, 13, 15, 17, 19,
    2, 4, 6, 8, 10,
    12, 14, 16, 18, 20,
]

# Lista ordenada de preguntas para el estudiante, con campo orden_presentacion (1..20) y pagina (1..4)
PREGUNTAS_VOCACIONALES = []
for index, qid in enumerate(ORDEN_PRESENTACION_IDS):
    q_data = dict(PREGUNTAS_POR_ID[qid])
    q_data["orden_presentacion"] = index + 1
    q_data["pagina"] = (index // 5) + 1
    PREGUNTAS_VOCACIONALES.append(q_data)

# Mapeo de IDs por área vocacional (2 preguntas por cada una de las 10 áreas)
PREGUNTAS_POR_AREA = {
    "Ingeniería y Tecnología": [1, 2],
    "Ciencias de la Salud": [3, 4],
    "Ciencias Administrativas y Económicas": [5, 6],
    "Derecho y Ciencias Sociales": [7, 8],
    "Educación y Pedagogía": [9, 10],
    "Ciencias Agropecuarias y Veterinaria": [11, 12],
    "Ciencias Naturales y Matemáticas": [13, 14],
    "Artes y Humanidades": [15, 16],
    "Arquitectura y Diseño": [17, 18],
    "Comunicación": [19, 20],
}
