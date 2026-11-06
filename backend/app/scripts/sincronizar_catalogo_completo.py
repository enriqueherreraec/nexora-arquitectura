import os
import sys
from pathlib import Path
from collections import defaultdict, Counter

backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

import openpyxl
from app.core.database import SessionLocal
from app.modules.catalogo.models import CarreraCatalogo
from app.modules.catalogo.utils import remover_tildes
from app.scripts.resolver_unidades import resolver_unidad_academica

def sincronizar_todo():
    excel_path = os.path.abspath(os.path.join(backend_dir, '..', 'Nexora_Universidades_Publicas_Ecuador_2026-10-13.xlsx'))
    print(f"Cargando Excel: {excel_path}")
    wb = openpyxl.load_workbook(excel_path)
    ws = wb['Carreras']
    
    db = SessionLocal()
    
    # 1. Procesar hoja Carreras del Excel
    filas = list(ws.iter_rows(min_row=7))
    print(f"Total filas en hoja Carreras: {len(filas)}")
    
    excel_records = []
    modificados_excel = 0
    
    for row in filas:
        cod = str(row[0].value or '').strip()
        sigla = str(row[2].value or '').strip().upper()
        carr = str(row[4].value or '').strip()
        titulo = str(row[5].value or '').strip()
        fac_actual = str(row[6].value or '').strip()
        respaldo_actual = str(row[7].value or '').strip()
        mod = str(row[9].value or '').strip()
        prov = str(row[10].value or '').strip()
        cant = str(row[11].value or '').strip()
        lugar = str(row[12].value or '').strip()
        semestres = str(row[13].value or '').strip()
        
        # Si la facultad no está verificada o está vacía, resolver con la fuente institucional oficial
        if not fac_actual or 'no verificada' in fac_actual.lower() or 'no especificada' in fac_actual.lower():
            fac_nueva, respaldo_nuevo, fuente_nueva = resolver_unidad_academica(sigla, carr, titulo, lugar, cant)
            row[6].value = fac_nueva
            row[7].value = respaldo_nuevo
            row[24].value = fuente_nueva  # Fuente de facultad (columna 25 / índice 24)
            fac_actual = fac_nueva
            respaldo_actual = respaldo_nuevo
            modificados_excel += 1
            
        excel_records.append({
            "cod": cod,
            "sigla": sigla,
            "carr": carr,
            "titulo": titulo,
            "fac": fac_actual,
            "respaldo": respaldo_actual,
            "mod": mod,
            "prov": prov,
            "cant": cant,
            "lugar": lugar,
            "semestres": semestres,
        })
        
    print(f"Filas de Excel enriquecidas con unidades oficiales: {modificados_excel}")
    wb.save(excel_path)
    print("Excel guardado exitosamente.")
    
    # 2. Actualizar PostgreSQL
    print("\nSincronizando con PostgreSQL...")
    db_carreras = db.query(CarreraCatalogo).all()
    print(f"Total registros en DB: {len(db_carreras)}")
    
    # Mapear por codigo_oferta
    por_codigo = {c.codigo_oferta: c for c in db_carreras if c.codigo_oferta}
    actualizados_db = 0
    
    for rec in excel_records:
        cod = rec["cod"]
        c = por_codigo.get(cod)
        if c:
            c.facultad = rec["fac"]
            c.respaldo_facultad = rec["respaldo"]
            c.es_vigente = True
            c.titulo_otorga = rec["titulo"] or c.titulo_otorga
            actualizados_db += 1
        else:
            # Buscar coincidencia exacta por sigla, carrera, modalidad y cantón
            carr_norm = remover_tildes(rec["carr"])
            mod_norm = remover_tildes(rec["mod"])
            cant_norm = remover_tildes(rec["cant"])
            cands = [
                x for x in db_carreras
                if x.siglas == rec["sigla"] and
                x.nombre_normalizado == carr_norm and
                x.modalidad_normalizada == mod_norm and
                (cant_norm in (x.canton_normalizado or '') or (x.canton_normalizado or '') in cant_norm)
            ]
            if cands:
                target = cands[0]
                target.codigo_oferta = cod
                target.facultad = rec["fac"]
                target.respaldo_facultad = rec["respaldo"]
                target.es_vigente = True
                por_codigo[cod] = target
                actualizados_db += 1
    
    print(f"Ofertas oficiales 2026 actualizadas en DB: {actualizados_db}")
    
    # 3. Reconciliar registros legacy y asignarles facultad para evitar 'no especificada'
    # Si un registro legacy duplica una oferta oficial vigente (misma sigla, carrera y modalidad),
    # marcar es_vigente = False para que no aparezca duplicado en la oferta actual, pero conservar su ID intacto
    codigos_vigentes = set(por_codigo.keys())
    pares_oficiales = set((c.siglas, c.nombre_normalizado, c.modalidad_normalizada) for c in por_codigo.values())
    
    duplicados_marcados = 0
    legacy_con_facultad = 0
    
    for c in db_carreras:
        if not c.codigo_oferta:
            # Si duplica una oferta oficial vigente
            clave = (c.siglas, c.nombre_normalizado, c.modalidad_normalizada)
            if clave in pares_oficiales and c.es_vigente:
                c.es_vigente = False
                duplicados_marcados += 1
            
            # Asignar facultad oficial a legacy si no la tiene
            if not c.facultad or 'no especificada' in c.facultad.lower() or 'no verificada' in c.facultad.lower():
                fac, resp, _ = resolver_unidad_academica(c.siglas or '', c.nombre or '', c.titulo_otorga or '', c.campus or '', c.canton or '')
                c.facultad = fac
                c.respaldo_facultad = resp
                legacy_con_facultad += 1
                
    db.commit()
    print(f"Duplicados legacy desactivados de oferta vigente: {duplicados_marcados}")
    print(f"Registros legacy actualizados con su facultad correspondiente: {legacy_con_facultad}")
    
    # 4. Verificación final de UTMACH y UNEMI
    print("\n=== VERIFICACIÓN FINAL UTMACH ===")
    utmach_vigentes = db.query(CarreraCatalogo).filter(
        CarreraCatalogo.siglas == 'UTMACH',
        CarreraCatalogo.es_vigente == True
    ).all()
    unicas_utmach = len(set(c.nombre for c in utmach_vigentes))
    facs_utmach = Counter(c.facultad for c in utmach_vigentes)
    print(f"Ofertas vigentes UTMACH: {len(utmach_vigentes)} | Carreras únicas: {unicas_utmach}")
    for f, cnt in facs_utmach.items():
        print(f"  - {f}: {cnt} ofertas")
        
    print("\n=== VERIFICACIÓN FINAL UNEMI ===")
    unemi_vigentes = db.query(CarreraCatalogo).filter(
        CarreraCatalogo.siglas == 'UNEMI',
        CarreraCatalogo.es_vigente == True
    ).all()
    unicas_unemi = len(set(c.nombre for c in unemi_vigentes))
    facs_unemi = Counter(c.facultad for c in unemi_vigentes)
    print(f"Ofertas vigentes UNEMI: {len(unemi_vigentes)} | Carreras únicas: {unicas_unemi}")
    for f, cnt in facs_unemi.items():
        print(f"  - {f}: {cnt} ofertas")

if __name__ == '__main__':
    sincronizar_todo()
