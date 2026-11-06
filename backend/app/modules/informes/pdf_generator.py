import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)

# Colores de la identidad Nexora
COLOR_MORADO_OSCURO = colors.HexColor("#382064")
COLOR_MORADO_PRINCIPAL = colors.HexColor("#7C3AED")
COLOR_LAVANDA_SUAVE = colors.HexColor("#EDE9FE")
COLOR_TEXTO_PRINCIPAL = colors.HexColor("#252238")
COLOR_TEXTO_SECUNDARIO = colors.HexColor("#716B86")
COLOR_TURQUESA = colors.HexColor("#14B8A6")
COLOR_FONDO_TABLA = colors.HexColor("#F7F7FC")
COLOR_AMBAR = colors.HexColor("#D97706")


def generar_pdf_informe_vocacional(
    estudiante_info: dict,
    evaluacion_info: dict
) -> io.BytesIO:
    """
    Genera un informe formal en PDF utilizando ReportLab con diseño universitario Nexora.
    Márgenes uniformes, tipografía consistente de 11pt y distinción explícita de datos simulados.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Definición de estilos tipográficos limpios
    estilo_titulo = ParagraphStyle(
        'TituloNexora',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=COLOR_MORADO_OSCURO,
        alignment=0,
        spaceAfter=4
    )

    estilo_subtitulo = ParagraphStyle(
        'SubtituloNexora',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=COLOR_MORADO_PRINCIPAL,
        alignment=0,
        spaceAfter=8
    )

    estilo_seccion = ParagraphStyle(
        'SeccionNexora',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=COLOR_MORADO_OSCURO,
        spaceBefore=12,
        spaceAfter=6
    )

    estilo_cuerpo = ParagraphStyle(
        'CuerpoNexora',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=COLOR_TEXTO_PRINCIPAL,
        spaceAfter=6
    )

    estilo_cuerpo_bold = ParagraphStyle(
        'CuerpoBoldNexora',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=COLOR_TEXTO_PRINCIPAL
    )

    estilo_tabla_header = ParagraphStyle(
        'TablaHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.white,
        alignment=0
    )

    estilo_tabla_celda = ParagraphStyle(
        'TablaCelda',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=COLOR_TEXTO_PRINCIPAL
    )

    estilo_nota = ParagraphStyle(
        'NotaNexora',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=COLOR_TEXTO_SECUNDARIO,
        spaceAfter=4
    )

    story = []

    # 1. ENCABEZADO INSTITUCIONAL
    story.append(Paragraph("NEXORA", estilo_titulo))
    story.append(Paragraph("Sistema de Orientación Vocacional y Consulta de Universidades Públicas del Ecuador", estilo_subtitulo))
    story.append(HRFlowable(width="100%", thickness=2, color=COLOR_MORADO_PRINCIPAL, spaceBefore=2, spaceAfter=10))

    # 2. DATOS DEL ESTUDIANTE Y PERFIL
    story.append(Paragraph("1. Perfil del Estudiante", estilo_seccion))
    fecha_str = datetime.now().strftime("%d/%m/%Y %H:%M")

    datos_perfil = [
        [
            Paragraph("<b>Estudiante:</b>", estilo_cuerpo_bold),
            Paragraph(estudiante_info.get("nombre", "Estudiante"), estilo_cuerpo),
            Paragraph("<b>Fecha de emisión:</b>", estilo_cuerpo_bold),
            Paragraph(fecha_str, estilo_cuerpo)
        ],
        [
            Paragraph("<b>Correo electrónico:</b>", estilo_cuerpo_bold),
            Paragraph(estudiante_info.get("email", "estudiante@correo.com"), estilo_cuerpo),
            Paragraph("<b>Provincia / Ciudad:</b>", estilo_cuerpo_bold),
            Paragraph(f"{estudiante_info.get('provincia', 'Pichincha')} / {estudiante_info.get('ciudad', 'Quito')}", estilo_cuerpo)
        ],
        [
            Paragraph("<b>Modalidad preferida:</b>", estilo_cuerpo_bold),
            Paragraph(estudiante_info.get("modalidad", "Presencial"), estilo_cuerpo),
            Paragraph("<b>Medio de transporte:</b>", estilo_cuerpo_bold),
            Paragraph(estudiante_info.get("transporte", "Transporte público"), estilo_cuerpo)
        ]
    ]

    t_perfil = Table(datos_perfil, colWidths=[130, 160, 120, 130])
    t_perfil.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLOR_LAVANDA_SUAVE),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOX', (0, 0), (-1, -1), 1, COLOR_MORADO_PRINCIPAL),
    ]))
    story.append(t_perfil)
    story.append(Spacer(1, 10))

    # 3. AFINIDAD VOCACIONAL CALCULADA POR ÁREA
    story.append(Paragraph("2. Resultados del Índice de Interés Declarado", estilo_seccion))
    story.append(Paragraph(
        "<b>Aclaración metodológica:</b> Los resultados corresponden a un <i>índice de interés vocacional declarado</i> "
        "conforme a las respuestas expresadas por el estudiante. No constituyen una medida psicométrica estandarizada de aptitud, "
        "probabilidad de ingreso ni puntaje de corte de admisión a universidades.",
        estilo_nota
    ))

    es_empate = evaluacion_info.get("es_empate", False)
    areas_empatadas = evaluacion_info.get("areas_empatadas", [])
    todas_cero = evaluacion_info.get("todas_cero", False)
    area_pred = evaluacion_info.get("area_predominante", "Ingeniería y Tecnología")

    if todas_cero:
        story.append(Paragraph(
            "<b>Aviso:</b> Todas las áreas recibieron una puntuación de cero puntos. Todavía no existe una preferencia identificada "
            "y se recomienda revisar las respuestas del cuestionario.",
            estilo_cuerpo
        ))
    elif es_empate and areas_empatadas:
        areas_str = ", ".join(areas_empatadas)
        story.append(Paragraph(
            f"Se ha detectado un <b>empate en el nivel de interés</b> entre las siguientes áreas: <b>{areas_str}</b>.",
            estilo_cuerpo
        ))
    else:
        story.append(Paragraph(
            f"Tu área de mayor interés declarado es: <b>{area_pred}</b>.",
            estilo_cuerpo
        ))

    puntuaciones = evaluacion_info.get("puntuaciones_areas", {})
    version_eval = evaluacion_info.get("version_cuestionario", "3.0-20preguntas")
    max_pts_eval = evaluacion_info.get("max_puntos_por_area", 8 if version_eval == "3.0-20preguntas" else 12)

    filas_puntuacion = [
        [Paragraph("Área Vocacional (10 Áreas)", estilo_tabla_header), Paragraph("Afinidad / Interés Calculado", estilo_tabla_header)]
    ]
    for area, pct in puntuaciones.items():
        es_top = (area == area_pred) or (es_empate and area in areas_empatadas)
        texto_area = f"<b>{area} (Interés Destacado)</b>" if es_top else area
        pts_calculados = round(pct * max_pts_eval / 100, 1)
        # Mostrar formato entero si es exacto (ej. 8 o 6 en vez de 8.0)
        pts_display = int(pts_calculados) if pts_calculados.is_integer() else pts_calculados
        filas_puntuacion.append([
            Paragraph(texto_area, estilo_tabla_celda),
            Paragraph(f"<b>{pct}%</b> ({pts_display}/{max_pts_eval} pts)", estilo_tabla_celda)
        ])

    t_afinidad = Table(filas_puntuacion, colWidths=[370, 170])
    t_afinidad.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_MORADO_OSCURO),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_FONDO_TABLA]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_afinidad)
    story.append(Spacer(1, 10))

    # 4. CARRERAS AFINES RECOMENDADAS DE UNIVERSIDADES PÚBLICAS
    story.append(Paragraph("3. Carreras Afines en Universidades Públicas (Ordenadas por Pertinencia y Cercanía)", estilo_seccion))
    story.append(Paragraph(
        "Las siguientes opciones corresponden a carreras públicas pertinentes a tus áreas de interés, "
        "priorizando cercanía geográfica y conservando alternativas de diversas universidades:",
        estilo_cuerpo
    ))

    carreras = evaluacion_info.get("carreras_sugeridas", [])[:8]
    filas_carreras = [
        [
            Paragraph("Carrera / Facultad", estilo_tabla_header),
            Paragraph("Institución / Campus", estilo_tabla_header),
            Paragraph("Modalidad", estilo_tabla_header),
            Paragraph("Puntaje / Referencia", estilo_tabla_header),
            Paragraph("Web Oficial", estilo_tabla_header),
        ]
    ]

    for c in carreras:
        facultad_str = c.get("facultad") or "Facultad institucional"
        enlace = c.get("pagina_web") or c.get("enlace_oficial") or "Portal institucional"
        
        # Referencia de puntaje con tipo y periodo
        tipo_ref = c.get("tipo_referencia") or ("Simulada" if c.get("puntaje_es_simulado") else "Histórica")
        periodo_ref = c.get("periodo_puntaje") or "2026-1"
        ptje_val = c.get("referencia_puntaje") or c.get("puntaje_referencial") or "Sin dato"
        
        if c.get("puntaje_es_simulado"):
            puntaje_str = f"{ptje_val}*<br/><font color='#D97706'>[Ref. simulada {periodo_ref}]</font>"
        elif ptje_val == "Sin dato oficial verificado" or ptje_val == "Sin dato":
            puntaje_str = f"<font color='#716B86'>Sin corte publicado<br/>({tipo_ref})</font>"
        else:
            puntaje_str = f"<b>{ptje_val}</b><br/><font color='#716B86'>{tipo_ref} ({periodo_ref})</font>"

        filas_carreras.append([
            Paragraph(f"<b>{c.get('nombre')}</b><br/><font color='#716B86'>{facultad_str}</font><br/>Afinidad: {c.get('afinidad_vocacional', 80)}%", estilo_tabla_celda),
            Paragraph(f"<b>{c.get('siglas')}</b> ({c.get('ciudad')})<br/>{c.get('tiempo_traslado', 'N/D')}", estilo_tabla_celda),
            Paragraph(c.get('modalidad', 'Presencial'), estilo_tabla_celda),
            Paragraph(puntaje_str, estilo_tabla_celda),
            Paragraph(f"<font color='#7C3AED'>{enlace}</font>", estilo_tabla_celda),
        ])

    t_carreras = Table(filas_carreras, colWidths=[150, 130, 75, 110, 75])
    t_carreras.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLOR_MORADO_PRINCIPAL),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, COLOR_FONDO_TABLA]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_carreras)

    # Nota de datos y verificación
    story.append(Spacer(1, 5))
    story.append(Paragraph(
        "<b>* Aclaración ética sobre datos y referencias:</b> Los puntajes históricos y mínimos de postulación conservan "
        "su fuente oficial y periodo cuando están respaldados. Aquellos valores sin respaldo mantienen su estado de verificación. "
        "No garantizan asignación de cupo.",
        estilo_nota
    ))

    # 5. RECOMENDACIONES PEDAGÓGICAS
    story.append(Spacer(1, 6))
    story.append(Paragraph("4. Recomendaciones Vocacionales", estilo_seccion))
    recomendaciones = evaluacion_info.get("recomendaciones", [])
    for rec in recomendaciones:
        story.append(Paragraph(f"• {rec}", estilo_cuerpo))

    # 6. PIE DE PÁGINA Y FUENTES
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_MORADO_OSCURO, spaceBefore=4, spaceAfter=6))
    story.append(Paragraph(
        "<b>Nexora:</b> Sistema de Orientación Vocacional y Consulta de Universidades Públicas del Ecuador • LOES / CES / SENESCYT.",
        estilo_nota
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer
