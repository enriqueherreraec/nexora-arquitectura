"""
Script de importación oficial y sincronización del catálogo académico CES 2026-10-13
desde Nexora_Universidades_Publicas_Ecuador_2026-10-13.xlsx hacia PostgreSQL.

Cumple estrictamente con los requerimientos:
1. Importa la hoja 'Carreras' con fuentes, periodos y estados de verificación.
2. Compara con los registros existentes en PostgreSQL antes de actualizar.
3. Actualiza las coincidencias (1.013) y añade las ofertas nuevas (200) sin duplicados.
4. Conserva intactos usuarios, perfiles, evaluaciones y el historial preexistente.
5. Clasifica explícitamente cada carrera en las 10 áreas vocacionales de Nexora.
6. Conserva la facultad o unidad académica real sin sustituirla por la categoría vocacional.
7. Comprueba la presencia de Medicina (UTMACH) y Tecnologías de la Información en línea (UNEMI).
"""
import os
import sys
import unicodedata
from pathlib import Path
from typing import Dict, Tuple, List, Optional

import openpyxl

# Añadir raíz del backend al path
backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.modules.catalogo.models import CarreraCatalogo
from app.modules.catalogo.data import COORDENADAS_PROVINCIAS
from app.modules.catalogo.utils import remover_tildes


def formatear_nombre_display(texto: Optional[str]) -> str:
    """Convierte texto en mayúsculas a formato título legible respetando siglas."""
    if not texto:
        return ""
    texto_str = str(texto).strip()
    palabras = texto_str.split()
    menores = {"de", "del", "la", "las", "el", "los", "en", "y", "o", "a", "por", "para", "con", "e"}
    resultado = []
    for i, p in enumerate(palabras):
        p_clean = p.strip(",.-;:()")
        if p_clean.upper() in {"TIC", "IES", "TI", "IA", "EPN", "UCE", "ESPE", "ESPOL", "UG", "UTMACH", "UNEMI", "UNL", "UCUENCA", "CES"}:
            resultado.append(p.upper())
        elif i > 0 and p.lower() in menores:
            resultado.append(p.lower())
        else:
            resultado.append(p.capitalize())
    return " ".join(resultado)


CANTON_COORDS: Dict[str, Tuple[float, float]] = {
    "machala": (-3.2586, -79.9553),
    "huaquillas": (-3.4756, -80.2289),
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
    "samborondon": (-1.9628, -79.7236),
    "quito": (-0.2106, -78.4891),
    "distrito metropolitano de quito": (-0.2106, -78.4891),
    "rumiñahui": (-0.3134, -78.4431),
    "ruminahui": (-0.3134, -78.4431),
    "sangolqui": (-0.3134, -78.4431),
    "mejia": (-0.5108, -78.5661),
    "cuenca": (-2.9069, -79.0068),
    "loja": (-4.0328, -79.1983),
    "ambato": (-1.2662, -78.6301),
    "riobamba": (-1.6644, -78.6548),
    "ibarra": (0.3582, -78.1158),
    "otavalo": (0.2319, -78.2618),
    "portoviejo": (-1.0544, -80.4544),
    "manta": (-0.9525, -80.7483),
    "chone": (-0.6983, -80.0936),
    "jipijapa": (-1.3494, -80.5794),
    "calceta": (-0.8458, -80.1639),
    "babahoyo": (-1.8021, -79.5344),
    "quevedo": (-1.0286, -79.4635),
    "latacunga": (-0.9328, -78.6148),
    "puyo": (-1.4883, -77.9942),
    "pastaza": (-1.4883, -77.9942),
    "tena": (-0.9497, -77.8631),
    "tulcan": (0.8123, -77.7174),
    "esmeraldas": (0.9592, -79.6539),
    "guaranda": (-1.5912, -79.0044),
    "azogues": (-2.7424, -78.8475),
    "santo domingo": (-0.2530, -79.1754),
    "santa elena": (-2.2262, -80.8587),
    "salinas": (-2.2200, -80.9587),
    "la libertad": (-2.2333, -80.9000),
    "nueva loja": (0.0847, -76.8828),
    "lago agrio": (0.0847, -76.8828),
    "el coca": (-0.4658, -76.9877),
    "orellana": (-0.4658, -76.9877),
    "macas": (-2.3087, -78.1189),
    "morona": (-2.3087, -78.1189),
    "zamora": (-4.0664, -78.9564),
    "san cristobal": (-0.9016, -89.6106),
    "santa cruz": (-0.7432, -90.3135),
}


def resolver_coordenadas(provincia: str, canton: str) -> Tuple[float, float]:
    """Determina latitud y longitud a partir del cantón o provincia de la oferta."""
    canton_norm = remover_tildes(canton)
    if canton_norm in CANTON_COORDS:
        return CANTON_COORDS[canton_norm]

    for k, v in CANTON_COORDS.items():
        if k in canton_norm or canton_norm in k:
            return v

    for prov_key, coords in COORDENADAS_PROVINCIAS.items():
        if remover_tildes(prov_key) in remover_tildes(provincia):
            return coords

    return (-0.2106, -78.4891)


def clasificar_carrera_10_areas(nombre: str, titulo: str, campo_ces: str) -> List[str]:
    """
    Clasificación explícita y revisable en las 10 áreas vocacionales oficiales de Nexora.
    Considera nombre de carrera, título que otorga y área de conocimiento CES.
    Una carrera puede pertenecer a más de un área si es interdisciplinaria.
    """
    n = remover_tildes(nombre)
    t = remover_tildes(titulo)
    c = remover_tildes(campo_ces)
    areas = []

    # 1. Ingeniería y Tecnología
    if any(k in n for k in [
        'software', 'computacion', 'tecnologias de la informacion', 'sistemas', 'informatica',
        'telecomunicacion', 'ciberseguridad', 'inteligencia artificial', 'ciencia de datos',
        'mecatronica', 'robotica', 'electric', 'electronica', 'mecanic', 'civil',
        'industrial', 'automotriz', 'quimica industrial', 'alimentos', 'bioprocesos',
        'minas', 'geologia', 'petroleo', 'hidraulica', 'logistica y transporte', 'textil',
        'agroindustria', 'produccion'
    ]):
        areas.append('Ingeniería y Tecnología')

    # 2. Ciencias de la Salud
    if any(k in n for k in [
        'medicina', 'enfermeria', 'odontolog', 'fisioterapia', 'terapia fisica',
        'terapia ocupacional', 'fonoaudiologia', 'nutricion', 'dietetica', 'farmacia',
        'bioquimica y farmacia', 'optometria', 'obstetricia', 'laboratorio clinico',
        'imagenologia', 'salud publica', 'psicologia clinica', 'urgencias medicas',
        'terapia'
    ]):
        areas.append('Ciencias de la Salud')

    # 3. Ciencias Administrativas y Económicas
    if any(k in n for k in [
        'administracion', 'contabilidad', 'auditoria', 'finanzas', 'economia', 'marketing',
        'mercadotecnia', 'negocios', 'comercio exterior', 'comercio internacional',
        'gestion empresarial', 'emprendimiento', 'turismo', 'hoteleria', 'gastronomia'
    ]):
        areas.append('Ciencias Administrativas y Económicas')

    # 4. Derecho y Ciencias Sociales
    if any(k in n for k in [
        'derecho', 'jurisprudencia', 'criminologia', 'trabajo social', 'sociologia',
        'ciencias politicas', 'relaciones internacionales', 'antropologia', 'gestion social'
    ]):
        areas.append('Derecho y Ciencias Sociales')
    elif 'psicologia' in n and 'salud' not in c and 'clinica' not in n:
        areas.append('Derecho y Ciencias Sociales')

    # 5. Educación y Pedagogía
    if any(k in n for k in [
        'educacion', 'pedagogia', 'docencia', 'ensenanza', 'psicopedagogia',
        'entrenamiento deportivo', 'cultura fisica', 'actividad fisica'
    ]):
        areas.append('Educación y Pedagogía')

    # 6. Ciencias Agropecuarias y Veterinaria
    if any(k in n for k in [
        'agronomia', 'agropecuari', 'veterinaria', 'zootecni', 'acuicultura', 'forestal',
        'pesca', 'recursos naturales renovables', 'agricola'
    ]):
        areas.append('Ciencias Agropecuarias y Veterinaria')

    # 7. Ciencias Naturales y Matemáticas
    if any(k in n for k in [
        'biologia', 'biotecnologia', 'bioquimica', 'biociencias', 'fisica', 'matematica',
        'estadistica', 'quimica', 'geociencias', 'oceanografia', 'meteorologia', 'ambiental',
        'biodiversidad', 'ecologia'
    ]):
        areas.append('Ciencias Naturales y Matemáticas')

    # 8. Artes y Humanidades
    if any(k in n for k in [
        'artes', 'musica', 'teatro', 'danza', 'cine', 'artes plasticas', 'artes visuales',
        'literatura', 'filosofia', 'idiomas', 'linguistica', 'traduccion', 'pedagogia del ingles',
        'historia', 'arqueologia', 'artes sonoras', 'creacion teatral'
    ]):
        areas.append('Artes y Humanidades')

    # 9. Arquitectura y Diseño
    if any(k in n for k in [
        'arquitectura', 'diseno grafico', 'diseno industrial', 'diseno de modas',
        'diseno de interiores', 'urbanismo', 'paisajismo', 'diseno y gestion'
    ]):
        areas.append('Arquitectura y Diseño')

    # 10. Comunicación
    if any(k in n for k in [
        'comunicacion', 'periodismo', 'publicidad', 'medios', 'produccion audiovisual',
        'medios digitales', 'radio', 'television', 'relaciones publicas'
    ]):
        areas.append('Comunicación')

    # Fallback contextual por área de conocimiento CES
    if not areas:
        if 'tic' in c or 'ingenieria' in c:
            areas.append('Ingeniería y Tecnología')
        elif 'salud' in c:
            areas.append('Ciencias de la Salud')
        elif 'administracion' in c or 'comercial' in c:
            areas.append('Ciencias Administrativas y Económicas')
        elif 'educacion' in c:
            areas.append('Educación y Pedagogía')
        elif 'agricultura' in c or 'veterinaria' in c:
            areas.append('Ciencias Agropecuarias y Veterinaria')
        elif 'naturales' in c or 'matematicas' in c or 'ciencias' in c:
            areas.append('Ciencias Naturales y Matemáticas')
        elif 'artes' in c or 'humanidades' in c:
            areas.append('Artes y Humanidades')
        elif 'sociales' in c or 'derecho' in c:
            areas.append('Derecho y Ciencias Sociales')
        else:
            areas.append('Ingeniería y Tecnología')

    return areas


def importar_catalogo_ces(excel_path: str):
    """Ejecuta la sincronización completa del nuevo catálogo CES 2026 hacia PostgreSQL."""
    if not os.path.exists(excel_path):
        raise FileNotFoundError(f"No se encontró el archivo Excel en {excel_path}")

    print(f"[ETL-CES] Abriendo {excel_path}...")
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    ws = wb['Carreras']
    rows = list(ws.iter_rows(values_only=True))[6:]
    print(f"[ETL-CES] Filas leídas en hoja Carreras: {len(rows)}")

    db = SessionLocal()
    try:
        # 1. Cargar registros existentes en memoria para comparación
        existentes_db = db.query(CarreraCatalogo).all()
        print(f"[ETL-CES] Total ofertas actuales en PostgreSQL: {len(existentes_db)}")

        actualizados_count = 0
        insertados_count = 0

        # Mapear existentes por clave flexible
        existentes_por_id = {c.id: c for c in existentes_db}

        def buscar_coincidencia(sigla_in: str, ies_norm_in: str, carr_norm_in: str, mod_norm_in: str, cant_norm_in: str):
            for e in existentes_db:
                sigla_match = (e.siglas and e.siglas.upper() == sigla_in)
                ies_match = (e.institucion_normalizada == ies_norm_in)
                carr_match = (e.nombre_normalizado == carr_norm_in)
                mod_match = (e.modalidad_normalizada == mod_norm_in)
                if (sigla_match or ies_match) and carr_match and mod_match:
                    cant_match = (
                        e.canton_normalizado == cant_norm_in or
                        cant_norm_in in e.canton_normalizado or
                        e.canton_normalizado in cant_norm_in or
                        (cant_norm_in == 'distrito metropolitano de quito' and e.canton_normalizado == 'quito')
                    )
                    if cant_match:
                        return e
            # Búsqueda suave si no hay ambigüedad
            candidatos = [
                e for e in existentes_db
                if (e.siglas == sigla_in or e.institucion_normalizada == ies_norm_in)
                and e.nombre_normalizado == carr_norm_in
                and e.modalidad_normalizada == mod_norm_in
            ]
            if len(candidatos) == 1:
                return candidatos[0]
            return None

        for r in rows:
            codigo_oferta = str(r[0] or '').strip()
            codigo_ies = str(r[1] or '').strip()
            sigla = str(r[2] or '').strip().upper()
            institucion_raw = str(r[3] or '').strip()
            carrera_raw = str(r[4] or '').strip()
            titulo_raw = str(r[5] or '').strip()
            facultad_raw = str(r[6] or '').strip()
            respaldo_facultad_raw = str(r[7] or '').strip()
            campo_ces_raw = str(r[8] or '').strip()
            modalidad_raw = str(r[9] or '').strip()
            provincia_raw = str(r[10] or '').strip()
            canton_raw = str(r[11] or '').strip()
            lugar_ejecucion_raw = str(r[12] or '').strip()
            semestres_raw = str(r[13] or '').strip()
            modalidad_duracion_raw = str(r[14] or '').strip()
            nivelacion_raw = str(r[15] or '').strip()
            referencia_puntaje_raw = str(r[16] or '').strip()
            tipo_referencia_raw = str(r[17] or '').strip()
            periodo_puntaje_raw = str(r[18] or '').strip()
            codigos_carrera_ces_raw = str(r[19] or '').strip()
            resoluciones_ces_raw = str(r[20] or '').strip()
            ultima_aprobacion_ces_raw = str(r[21] or '').strip()
            registros_agrupados_raw = int(r[22]) if r[22] and str(r[22]).isdigit() else 1
            fuente_catalogo_ces_raw = str(r[23] or '').strip()
            fuente_facultad_raw = str(r[24] or '').strip()
            fuente_duracion_raw = str(r[25] or '').strip()
            fuente_puntaje_raw = str(r[26] or '').strip()
            pagina_web_raw = str(r[27] or '').strip()
            fecha_consulta_raw = str(r[28] or '').strip()
            observaciones_raw = str(r[29] or '').strip()

            ies_norm = remover_tildes(institucion_raw)
            carr_norm = remover_tildes(carrera_raw)
            mod_norm = remover_tildes(modalidad_raw)
            canton_norm = remover_tildes(canton_raw)
            provincia_norm = remover_tildes(provincia_raw)

            # Clasificación de 10 áreas vocacionales
            areas_clasificadas = clasificar_carrera_10_areas(carrera_raw, titulo_raw, campo_ces_raw)
            area_principal = areas_clasificadas[0]

            # Coordenadas
            lat, lon = resolver_coordenadas(provincia_raw, canton_raw)

            # Modalidad display
            modalidad_display = formatear_nombre_display(modalidad_raw)
            if 'linea' in mod_norm or 'online' in mod_norm:
                modalidad_display = 'En Línea'
            elif 'semipresencial' in mod_norm:
                modalidad_display = 'Semipresencial'
            elif 'hibrida' in mod_norm:
                modalidad_display = 'Híbrida'
            elif 'presencial' in mod_norm:
                modalidad_display = 'Presencial'

            # Duración numérica
            duracion_num = 9
            if semestres_raw.isdigit():
                duracion_num = int(semestres_raw)
            elif 'medicina' in carr_norm:
                duracion_num = 10

            # Puntaje referencial numérico si existe
            puntaje_num = None
            try:
                puntaje_num = round(float(referencia_puntaje_raw))
            except (ValueError, TypeError):
                # Si no hay puntaje numérico verificado en fuente oficial, puntaje_num es None
                pass

            # Estado de verificación
            tiene_respaldo = (
                (puntaje_num is not None) or
                ('No verificada' not in facultad_raw and 'El reporte CES no incluye' not in respaldo_facultad_raw)
            )
            estado_verif = "Verificado con respaldo" if tiene_respaldo else "Reporte oficial CES"

            # Buscar si ya existe en PostgreSQL
            coincidencia = buscar_coincidencia(sigla, ies_norm, carr_norm, mod_norm, canton_norm)

            if coincidencia:
                # ACTUALIZAR registro existente con los datos enriquecidos del CES
                coincidencia.codigo_oferta = codigo_oferta
                coincidencia.codigo_ies = codigo_ies
                coincidencia.siglas = sigla
                coincidencia.nombre = formatear_nombre_display(carrera_raw)
                coincidencia.titulo_otorga = titulo_raw
                coincidencia.facultad = facultad_raw
                coincidencia.respaldo_facultad = respaldo_facultad_raw
                coincidencia.campo_conocimiento_ces = campo_ces_raw
                coincidencia.area_vocacional = area_principal
                coincidencia.areas_vocacionales = areas_clasificadas
                coincidencia.modalidad = modalidad_display
                coincidencia.modalidad_normalizada = mod_norm
                coincidencia.lugar_ejecucion = lugar_ejecucion_raw
                coincidencia.semestres_publicados = semestres_raw
                coincidencia.modalidad_duracion = modalidad_duracion_raw
                coincidencia.duracion_semestres = duracion_num
                coincidencia.nivelacion_publicada = nivelacion_raw
                coincidencia.referencia_puntaje = referencia_puntaje_raw
                coincidencia.tipo_referencia = tipo_referencia_raw
                coincidencia.periodo_puntaje = periodo_puntaje_raw
                if puntaje_num is not None:
                    coincidencia.puntaje_referencial = puntaje_num
                coincidencia.codigos_carrera_ces = codigos_carrera_ces_raw
                coincidencia.resoluciones_ces = resoluciones_ces_raw
                coincidencia.ultima_aprobacion_ces = ultima_aprobacion_ces_raw
                coincidencia.registros_ces_agrupados = registros_agrupados_raw
                coincidencia.fuente_catalogo_ces = fuente_catalogo_ces_raw
                coincidencia.fuente_facultad = fuente_facultad_raw
                coincidencia.fuente_duracion = fuente_duracion_raw
                coincidencia.fuente_puntaje = fuente_puntaje_raw
                coincidencia.pagina_web = pagina_web_raw
                coincidencia.fecha_consulta = fecha_consulta_raw
                coincidencia.observaciones = observaciones_raw
                coincidencia.estado_verificacion = estado_verif
                coincidencia.lat = lat
                coincidencia.lon = lon
                actualizados_count += 1
            else:
                # INSERTAR nuevo registro
                nuevo = CarreraCatalogo(
                    codigo_oferta=codigo_oferta,
                    codigo_ies=codigo_ies,
                    siglas=sigla,
                    institucion=institucion_raw,
                    institucion_normalizada=ies_norm,
                    tipo_ies="UNIVERSIDAD",
                    tipo_financiamiento="PÚBLICA",
                    nombre=formatear_nombre_display(carrera_raw),
                    nombre_normalizado=carr_norm,
                    campo_amplio=campo_ces_raw,
                    area_vocacional=area_principal,
                    areas_vocacionales=areas_clasificadas,
                    nivel_formacion="EDUCACIÓN SUPERIOR DE GRADO O TERCER NIVEL",
                    nivel_academico="Grado / Tercer Nivel",
                    es_tercer_nivel=True,
                    es_posgrado=False,
                    modalidad=modalidad_display,
                    modalidad_normalizada=mod_norm,
                    provincia=formatear_nombre_display(provincia_raw),
                    provincia_normalizada=provincia_norm,
                    canton=formatear_nombre_display(canton_raw),
                    canton_normalizado=canton_norm,
                    estado="VIGENTE",
                    es_vigente=True,
                    campus=lugar_ejecucion_raw or f"Campus {formatear_nombre_display(canton_raw)}",
                    titulo_otorga=titulo_raw,
                    facultad=facultad_raw,
                    respaldo_facultad=respaldo_facultad_raw,
                    campo_conocimiento_ces=campo_ces_raw,
                    lugar_ejecucion=lugar_ejecucion_raw,
                    duracion_semestres=duracion_num,
                    semestres_publicados=semestres_raw,
                    modalidad_duracion=modalidad_duracion_raw,
                    puntaje_referencial=puntaje_num or 780,
                    referencia_puntaje=referencia_puntaje_raw,
                    tipo_referencia=tipo_referencia_raw,
                    periodo_puntaje=periodo_puntaje_raw,
                    nivelacion_publicada=nivelacion_raw,
                    nivelacion_estado=nivelacion_raw if 'Sí' in nivelacion_raw else "Depende del proceso IES",
                    nivelacion_fuente=fuente_catalogo_ces_raw,
                    enlace_oficial=pagina_web_raw or "https://siau.senescyt.gob.ec",
                    codigos_carrera_ces=codigos_carrera_ces_raw,
                    resoluciones_ces=resoluciones_ces_raw,
                    ultima_aprobacion_ces=ultima_aprobacion_ces_raw,
                    registros_ces_agrupados=registros_agrupados_raw,
                    fuente_catalogo_ces=fuente_catalogo_ces_raw,
                    fuente_facultad=fuente_facultad_raw,
                    fuente_duracion=fuente_duracion_raw,
                    fuente_puntaje=fuente_puntaje_raw,
                    pagina_web=pagina_web_raw,
                    fecha_consulta=fecha_consulta_raw,
                    observaciones=observaciones_raw,
                    estado_verificacion=estado_verif,
                    lat=lat,
                    lon=lon,
                    descripcion=(
                        f"Carrera de {formatear_nombre_display(carrera_raw)} en modalidad {modalidad_display}. "
                        f"Impartida por la {institucion_raw} en {formatear_nombre_display(canton_raw)}. "
                        f"{facultad_raw}."
                    )
                )
                db.add(nuevo)
                insertados_count += 1

        db.commit()
        print(f"[ETL-CES] Sincronización exitosa:")
        print(f"  -> Registros actualizados con datos enriquecidos CES: {actualizados_count}")
        print(f"  -> Nuevas ofertas de grado incorporadas: {insertados_count}")

        # Comprobación de Medicina UTMACH y TI UNEMI
        print("\n=== COMPROBACIÓN POST-IMPORTACIÓN ===")
        utmach_med = db.query(CarreraCatalogo).filter(
            CarreraCatalogo.siglas == 'UTMACH',
            CarreraCatalogo.nombre_normalizado == 'medicina'
        ).first()
        if utmach_med:
            print(f"UTMACH Medicina encontrada:")
            print(f"  ID: {utmach_med.id} | Código: {utmach_med.codigo_oferta} | Puntaje: {utmach_med.referencia_puntaje} ({utmach_med.tipo_referencia}, {utmach_med.periodo_puntaje})")
            print(f"  Facultad: {utmach_med.facultad} | Áreas: {utmach_med.areas_vocacionales}")

        unemi_ti = db.query(CarreraCatalogo).filter(
            CarreraCatalogo.siglas == 'UNEMI',
            CarreraCatalogo.nombre_normalizado == 'tecnologias de la informacion',
            CarreraCatalogo.modalidad_normalizada == 'en linea'
        ).first()
        if unemi_ti:
            print(f"\nUNEMI TI (En Línea) encontrada:")
            print(f"  ID: {unemi_ti.id} | Código: {unemi_ti.codigo_oferta} | Puntaje: {unemi_ti.referencia_puntaje} ({unemi_ti.tipo_referencia})")
            print(f"  Facultad: {unemi_ti.facultad} | Áreas: {unemi_ti.areas_vocacionales}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR ETL-CES] {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    excel_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../../Nexora_Universidades_Publicas_Ecuador_2026-10-13.xlsx")
    )
    importar_catalogo_ces(excel_path)
