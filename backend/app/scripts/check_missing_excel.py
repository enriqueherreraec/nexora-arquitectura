import os
import sys
from pathlib import Path
backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))
import openpyxl
from app.core.database import SessionLocal
from app.modules.catalogo.models import CarreraCatalogo

wb = openpyxl.load_workbook('../Nexora_Universidades_Publicas_Ecuador_2026-10-13.xlsx', data_only=True)
ws = wb['Carreras']
rows = list(ws.iter_rows(min_row=7, values_only=True))

db = SessionLocal()
db_codigos = set(r[0] for r in db.query(CarreraCatalogo.codigo_oferta).filter(CarreraCatalogo.codigo_oferta.isnot(None)).all())

print(f"Total filas en Excel: {len(rows)}")
print(f"Total códigos en DB: {len(db_codigos)}")

faltantes = []
for r in rows:
    cod = str(r[0] or '').strip()
    if cod not in db_codigos:
        faltantes.append((cod, r[2], r[4], r[9], r[11]))

print(f"Faltantes en DB ({len(faltantes)}):")
for f in faltantes:
    print(f)
