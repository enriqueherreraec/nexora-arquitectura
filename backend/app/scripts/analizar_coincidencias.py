import openpyxl
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.modules.catalogo.models import CarreraCatalogo
from app.modules.catalogo.utils import remover_tildes

wb = openpyxl.load_workbook('../data/Universidades_publicas_Ecuador_2026.xlsx', data_only=True)
ws_c = wb['Carreras']

db = SessionLocal()
all_db = db.query(CarreraCatalogo).all()

db_by_sigla = {}
for c in all_db:
    sig = c.siglas.strip().upper() if c.siglas else ''
    db_by_sigla.setdefault(sig, []).append(c)

unmatched = []
fuzzy_matches = []

for r in range(7, ws_c.max_row+1):
    sigla = ws_c.cell(r, 1).value
    carr = ws_c.cell(r, 4).value
    fac = ws_c.cell(r, 3).value
    if not sigla or not carr:
        continue
    sigla = str(sigla).strip().upper()
    carr = str(carr).strip()
    carr_norm = remover_tildes(carr).lower()
    
    # Exact match in this sigla
    existing = [c for c in db_by_sigla.get(sigla, []) if remover_tildes(c.nombre).lower() == carr_norm]
    if not existing:
        # Check if 'Ingeniería en ' or 'Licenciatura en ' prefix is different
        clean_carr = carr_norm.replace('ingenieria en ', '').replace('licenciatura en ', '').replace('ingenieria ', '').replace('licenciatura ', '').strip()
        candidates = []
        for c in db_by_sigla.get(sigla, []):
            db_norm = remover_tildes(c.nombre).lower()
            clean_db = db_norm.replace('ingenieria en ', '').replace('licenciatura en ', '').replace('ingenieria ', '').replace('licenciatura ', '').strip()
            if clean_carr == clean_db or clean_carr in clean_db or clean_db in clean_carr:
                candidates.append(c)
        if candidates:
            fuzzy_matches.append((sigla, carr, fac, candidates[0].nombre, candidates[0].id))
        else:
            unmatched.append((sigla, carr, fac))

print(f"Total rows in Excel Carreras: 510")
print(f"Exact matches: {510 - len(fuzzy_matches) - len(unmatched)}")
print(f"Fuzzy prefix/clean matches: {len(fuzzy_matches)}")
print(f"Truly new / unmatched in DB: {len(unmatched)}")

print("\n--- SAMPLE FUZZY MATCHES (first 15) ---")
for s, c, f, db_n, db_id in fuzzy_matches[:15]:
    print(f"[{s}] Excel: '{c}' <---> DB (ID {db_id}): '{db_n}'")

print(f"\n--- TRULY NEW / UNMATCHED ({len(unmatched)}) ---")
for s, c, f in unmatched:
    print(f"[{s}] Excel: '{c}' ({f})")
