import openpyxl
import sys
from collections import Counter
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.modules.catalogo.models import CarreraCatalogo
from app.modules.catalogo.utils import remover_tildes
from app.scripts.importar_catalogo_ces_2026 import CANTON_COORDS, resolver_coordenadas

# Función de clasificación probada
def clasificar_10_areas(nombre: str, facultad: str = ''):
    n = remover_tildes(nombre).lower()
    f = remover_tildes(facultad).lower()
    areas = []
    
    es_veterinaria = ('veterinaria' in n or 'zootecni' in n)

    if es_veterinaria or any(k in n for k in [
        'agronomia', 'agropecuari', 'acuicultura', 'forestal', 'pesca',
        'recursos naturales renovables', 'agricola', 'agronegocios'
    ]):
        areas.append('Ciencias Agropecuarias y Veterinaria')

    if not es_veterinaria and any(k in n for k in [
        'medicina', 'enfermeria', 'odontolog', 'fisioterapia', 'terapia fisica',
        'terapia ocupacional', 'fonoaudiologia', 'nutricion', 'dietetica', 'farmacia',
        'bioquimica y farmacia', 'optometria', 'obstetricia', 'laboratorio clinico',
        'imagenologia', 'salud publica', 'psicologia clinica', 'urgencias medicas',
        'terapia', 'promocion de la salud', 'salud y servicios'
    ]):
        areas.append('Ciencias de la Salud')

    if any(k in n for k in [
        'software', 'computacion', 'tecnologias de la informacion', 'tecnologia de la informacion',
        'sistemas', 'informatica', 'telecomunicacion', 'ciberseguridad', 'inteligencia artificial',
        'ciencia de datos', 'mecatronica', 'robotica', 'electric', 'electronica', 'mecanic',
        'civil', 'industrial', 'automotriz', 'quimica industrial', 'alimentos', 'bioprocesos',
        'minas', 'geologia', 'petroleo', 'hidraulica', 'logistica y transporte', 'textil',
        'agroindustria', 'produccion', 'ingenieria quimica', 'ingenieria en', 'ingenieria ambiental',
        'geomatica', 'geoespacial', 'realidad virtual', 'videojuego', 'inteligencia de los negocios'
    ]):
        if 'Ingeniería y Tecnología' not in areas:
            areas.append('Ingeniería y Tecnología')

    if any(k in n for k in [
        'administracion', 'contabilidad', 'auditoria', 'finanzas', 'economia', 'marketing',
        'mercadotecnia', 'negocios', 'comercio', 'gestion empresarial', 'emprendimiento',
        'turismo', 'hoteleria', 'gastronomia', 'gestion del transporte', 'talento humano',
        'gestion publica', 'administracion publica'
    ]):
        areas.append('Ciencias Administrativas y Económicas')

    if any(k in n for k in [
        'derecho', 'jurisprudencia', 'criminologia', 'trabajo social', 'sociologia',
        'ciencias politicas', 'politica', 'relaciones internacionales', 'antropologia',
        'gestion social', 'seguridad ciudadana', 'ciencias policiales', 'ciencias forenses'
    ]):
        areas.append('Derecho y Ciencias Sociales')
    elif 'psicologia' in n and 'clinica' not in n and 'educativa' not in n:
        areas.append('Derecho y Ciencias Sociales')

    if any(k in n for k in [
        'educacion', 'pedagogia', 'docencia', 'ensenanza', 'psicopedagogia',
        'entrenamiento deportivo', 'cultura fisica', 'actividad fisica', 'psicologia educativa'
    ]):
        areas.append('Educación y Pedagogía')

    if any(k in n for k in [
        'arquitectura', 'diseno grafico', 'diseno industrial', 'diseno de modas',
        'diseno de interiores', 'urbanismo', 'paisajismo', 'diseno y gestion'
    ]):
        areas.append('Arquitectura y Diseño')

    if any(k in n for k in [
        'comunicacion', 'periodismo', 'publicidad', 'medios', 'produccion audiovisual',
        'medios digitales', 'radio', 'television', 'relaciones publicas'
    ]):
        areas.append('Comunicación')

    if any(k in n for k in [
        'artes', 'musica', 'teatro', 'danza', 'cine', 'artes plasticas', 'artes visuales',
        'literatura', 'filosofia', 'idiomas', 'linguistica', 'traduccion', 'pedagogia del ingles',
        'historia', 'arqueologia', 'artes sonoras', 'creacion teatral', 'produccion musical'
    ]):
        areas.append('Artes y Humanidades')

    if any(k in n for k in [
        'biologia', 'biotecnologia', 'bioquimica', 'biociencias', 'fisica', 'matematica',
        'estadistica', 'quimica', 'geociencias', 'oceanografia', 'meteorologia', 'ambiental',
        'biodiversidad', 'ecologia', 'ciencias del agua', 'hidrologia', 'geologia'
    ]) and 'ingenieria quimica' not in n and 'ingenieria ambiental' not in n:
        areas.append('Ciencias Naturales y Matemáticas')

    if not areas:
        if any(k in f for k in ['ingenieria', 'tecnolog', 'sistemas', 'ciencias aplicadas', 'informatica']):
            areas.append('Ingeniería y Tecnología')
        elif any(k in f for k in ['salud', 'medicina', 'enfermeria']):
            areas.append('Ciencias de la Salud')
        elif any(k in f for k in ['administracion', 'economi', 'empresarial', 'comercial']):
            areas.append('Ciencias Administrativas y Económicas')
        elif any(k in f for k in ['educacion', 'pedagog']):
            areas.append('Educación y Pedagogía')
        elif any(k in f for k in ['agropecuari', 'veterinaria', 'ciencias agrarias']):
            areas.append('Ciencias Agropecuarias y Veterinaria')
        elif any(k in f for k in ['arte', 'humanidad', 'filosofia']):
            areas.append('Artes y Humanidades')
        elif any(k in f for k in ['social', 'derecho', 'jurisprudencia']):
            areas.append('Derecho y Ciencias Sociales')
        else:
            areas.append('Ingeniería y Tecnología')

    return areas

# Aliases de siglas entre DB anterior y nuevo Excel
SIGLA_ALIASES = {
    'UTLVTE': ['UTLVTE', 'UTELVT'],
    'UAW': ['UAW', 'UINPIAW'],
    'YACHAY TECH': ['YACHAY TECH', 'UITEY'],
}

def dry_run_sync():
    wb = openpyxl.load_workbook('../data/Universidades_publicas_Ecuador_2026.xlsx', data_only=True)
    ws_u = wb['Universidades']
    ws_c = wb['Carreras']

    univ_meta = {}
    for r in range(7, ws_u.max_row+1):
        s = ws_u.cell(r, 1).value
        if s:
            s = str(s).strip()
            univ_meta[s] = {
                'sigla': s,
                'nombre': str(ws_u.cell(r, 2).value or '').strip(),
                'provincia': str(ws_u.cell(r, 3).value or '').strip(),
                'ciudad': str(ws_u.cell(r, 4).value or '').strip(),
                'estado': str(ws_u.cell(r, 5).value or '').strip(),
                'registros_excel': int(ws_u.cell(r, 6).value or 0),
                'alcance': str(ws_u.cell(r, 7).value or '').strip(),
                'portal': str(ws_u.cell(r, 9).value or '').strip(),
                'ces': str(ws_u.cell(r, 10).value or '').strip(),
            }

    db = SessionLocal()
    all_db = db.query(CarreraCatalogo).all()
    print(f"Total registros existentes en DB: {len(all_db)}")

    used_db_ids = set()
    matches_exact = 0
    matches_fuzzy = 0
    matches_inst = 0
    new_inserts = 0

    carreras_por_sigla_db = {}
    for c in all_db:
        sig = c.siglas.strip().upper() if c.siglas else ''
        carreras_por_sigla_db.setdefault(sig, []).append(c)

    excel_counts = Counter()

    for r in range(7, ws_c.max_row+1):
        sigla = ws_c.cell(r, 1).value
        univ = ws_c.cell(r, 2).value
        fac = ws_c.cell(r, 3).value
        carr = ws_c.cell(r, 4).value
        periodo = ws_c.cell(r, 5).value
        estado_verif = ws_c.cell(r, 6).value
        obs = ws_c.cell(r, 7).value
        fuente = ws_c.cell(r, 9).value

        if not sigla or not carr:
            continue

        sigla = str(sigla).strip()
        carr = str(carr).strip()
        fac = str(fac).strip()
        excel_counts[sigla] += 1

        carr_norm = remover_tildes(carr).lower()
        sigla_variants = SIGLA_ALIASES.get(sigla, [sigla])

        # Pool de candidatos en DB
        candidates_db = []
        for s_var in sigla_variants:
            candidates_db.extend(carreras_por_sigla_db.get(s_var.upper(), []))

        # Prioridad 1: Match exacto por nombre normalizado
        matched = None
        for c in candidates_db:
            if c.id not in used_db_ids and remover_tildes(c.nombre).lower() == carr_norm:
                matched = c
                matches_exact += 1
                break

        # Prioridad 2: Match difuso (limpiando prefijos ingenieria / licenciatura)
        if not matched:
            clean_carr = carr_norm.replace('ingenieria en ', '').replace('licenciatura en ', '').replace('ingenieria ', '').replace('licenciatura ', '').strip()
            for c in candidates_db:
                if c.id not in used_db_ids:
                    db_norm = remover_tildes(c.nombre).lower()
                    clean_db = db_norm.replace('ingenieria en ', '').replace('licenciatura en ', '').replace('ingenieria ', '').replace('licenciatura ', '').strip()
                    if clean_carr == clean_db or clean_carr in clean_db or clean_db in clean_carr:
                        matched = c
                        matches_fuzzy += 1
                        break

        # Prioridad 3: Match por nombre de institución si sigla falló
        if not matched:
            univ_norm = remover_tildes(univ).lower()
            for c in all_db:
                if c.id not in used_db_ids and c.institucion_normalizada == univ_norm and remover_tildes(c.nombre).lower() == carr_norm:
                    matched = c
                    matches_inst += 1
                    break

        if matched:
            used_db_ids.add(matched.id)
        else:
            new_inserts += 1

    print(f"\n--- RESULTADO DE LA COMPARACIÓN ---")
    print(f"Total carreras procesadas del Excel: 510")
    print(f"Coincidencias exactas actualizadas: {matches_exact}")
    print(f"Coincidencias difusas/alias actualizadas: {matches_fuzzy}")
    print(f"Coincidencias por institución actualizadas: {matches_inst}")
    print(f"Total actualizados en DB sin duplicar: {matches_exact + matches_fuzzy + matches_inst}")
    print(f"Nuevas inserciones requeridas: {new_inserts}")
    print(f"Total registros que quedarán ACTIVOS (es_vigente=True): {len(used_db_ids) + new_inserts} (Esperado: 510)")
    print(f"Total registros anteriores retirados (es_vigente=False): {len(all_db) - len(used_db_ids)}")

    print(f"\n--- CONTEO POR UNIVERSIDAD vs HOJA UNIVERSIDADES ---")
    all_ok = True
    for s, meta in univ_meta.items():
        esperado = meta['registros_excel']
        encontrado = excel_counts.get(s, 0)
        status = "OK" if esperado == encontrado else "DISCREPANCIA"
        if status != "OK":
            all_ok = False
        print(f"  {s:12s} | Excel Carreras: {encontrado:2d} | Registros hoja Univ: {esperado:2d} | {status}")

    print(f"\n¿Todas las 36 universidades coinciden exactamente con la hoja Universidades?: {all_ok}")
    db.close()

if __name__ == "__main__":
    dry_run_sync()
