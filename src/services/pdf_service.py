import io
from typing import Dict, Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


def generar_pdf_informe_vocacional(estudiante: Dict[str, Any], evaluacion: Dict[str, Any]) -> io.BytesIO:
    """
    Genera en memoria un documento PDF oficial de informe vocacional utilizando ReportLab.
    Retorna un flujo BytesIO listo para ser adjuntado o descargado.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#18583F"),
        alignment=1,  # Centrado
        spaceAfter=15,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#333333"),
        alignment=1,
        spaceAfter=20,
    )

    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Heading2"],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#18583F"),
        spaceBefore=12,
        spaceAfter=8,
    )

    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#222222"),
    )

    story = []

    # Encabezado
    story.append(Paragraph("NEXORA · ORIENTACIÓN VOCACIONAL", title_style))
    story.append(Paragraph("Informe Oficial de Evaluación Vocacional y Recomendación Universitaria", subtitle_style))
    story.append(Spacer(1, 10))

    # Datos del estudiante
    story.append(Paragraph("1. Información del Estudiante Titular", h2_style))
    info_data = [
        ["Nombre Completo:", estudiante.get("nombre", "Estudiante")],
        ["Correo Electrónico:", estudiante.get("email", "")],
        ["Provincia y Ciudad:", f"{estudiante.get('provincia', 'Pichincha')} - {estudiante.get('ciudad', 'Quito')}"],
        ["Modalidad Preferida:", estudiante.get("modalidad", "Presencial")],
        ["Versión Cuestionario:", evaluacion.get("version_cuestionario", "3.0-20preguntas")],
    ]
    info_table = Table(info_data, colWidths=[150, 350])
    info_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F0F4F2")),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#222222")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DDDDDD")),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 15))

    # Resultados y área predominante
    story.append(Paragraph("2. Diagnóstico Vocacional Obtenido", h2_style))
    area_pred = evaluacion.get("area_predominante", "N/A")
    story.append(Paragraph(f"<b>Área Vocacional Predominante:</b> {area_pred}", body_style))
    story.append(Spacer(1, 6))

    # Tabla de puntuaciones por área
    puntuaciones = evaluacion.get("puntuaciones_areas", {})
    puntos_data = [["Área de Conocimiento Evaluada", "Puntos (máx 8)"]]
    for area, pts in puntuaciones.items():
        puntos_data.append([area, str(pts)])

    puntos_table = Table(puntos_data, colWidths=[380, 120])
    puntos_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#18583F")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (1, 0), (1, -1), "CENTER"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
    ]))
    story.append(puntos_table)
    story.append(Spacer(1, 15))

    # Carreras sugeridas
    story.append(Paragraph("3. Opciones Universitarias Recomendadas", h2_style))
    carreras = evaluacion.get("carreras_sugeridas", [])
    if carreras:
        carreras_data = [["Carrera Universitaria", "Universidad Pública", "Provincia", "Afinidad"]]
        for c in carreras[:5]:
            carreras_data.append([
                c.get("nombre_carrera", ""),
                c.get("universidad", ""),
                c.get("provincia", ""),
                f"{c.get('puntaje_afinidad', 0)}%"
            ])
        carreras_table = Table(carreras_data, colWidths=[180, 180, 80, 60])
        carreras_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2E7D5A")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
        ]))
        story.append(carreras_table)
    else:
        story.append(Paragraph("No se registraron carreras específicas para este intento.", body_style))

    # Pie institucional
    story.append(Spacer(1, 25))
    aviso = ("<b>Nota importante:</b> Los resultados de este informe tienen carácter estrictamente orientativo "
             "y no garantizan admisión universitaria ni afinidad profesional definitiva conforme a R6.")
    story.append(Paragraph(aviso, ParagraphStyle("NotaLegal", parent=styles["Normal"], fontSize=8, leading=11, textColor=colors.gray)))

    doc.build(story)
    buffer.seek(0)
    return buffer
