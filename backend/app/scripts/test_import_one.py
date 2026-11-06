import os
import sys
from pathlib import Path
backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.modules.catalogo.models import CarreraCatalogo

db = SessionLocal()
matches = db.query(CarreraCatalogo).filter(
    CarreraCatalogo.siglas == 'ESPOCH',
    CarreraCatalogo.nombre_normalizado.ilike('%contabilidad%')
).all()
print(f"ESPOCH contabilidad matches: {len(matches)}")
for m in matches:
    print(f"  ID: {m.id} | Cod: {m.codigo_oferta} | Mod: {m.modalidad} | Cant: {m.canton} | Vig: {m.es_vigente}")
