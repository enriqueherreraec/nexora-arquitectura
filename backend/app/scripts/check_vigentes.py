import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.modules.catalogo.models import CarreraCatalogo
from collections import Counter

db = SessionLocal()

print("=== UTMACH VIGENTES EN DB ===")
vigentes_utmach = db.query(CarreraCatalogo).filter(
    CarreraCatalogo.siglas == 'UTMACH',
    CarreraCatalogo.es_vigente == True
).all()
print(f"Total vigentes: {len(vigentes_utmach)}")

carreras_counter = Counter(c.nombre for c in vigentes_utmach)
for nom, cnt in carreras_counter.most_common():
    items = [c for c in vigentes_utmach if c.nombre == nom]
    mods = [c.modalidad for c in items]
    cantones = [c.canton for c in items]
    cods = [c.codigo_oferta for c in items]
    facs = [c.facultad for c in items]
    ids = [c.id for c in items]
    print(f"  * {nom} ({cnt} ofertas):")
    for item in items:
        print(f"      ID: {item.id} | Cod: {item.codigo_oferta} | Mod: {item.modalidad} | Cantón: {item.canton} | Campus: {item.campus} | Fac: {item.facultad}")

print("\n=== UNEMI VIGENTES EN DB ===")
vigentes_unemi = db.query(CarreraCatalogo).filter(
    CarreraCatalogo.siglas == 'UNEMI',
    CarreraCatalogo.es_vigente == True
).all()
print(f"Total vigentes: {len(vigentes_unemi)}")
carreras_counter = Counter(c.nombre for c in vigentes_unemi)
for nom, cnt in carreras_counter.most_common(10):
    items = [c for c in vigentes_unemi if c.nombre == nom]
    print(f"  * {nom} ({cnt} ofertas):")
    for item in items:
        print(f"      ID: {item.id} | Cod: {item.codigo_oferta} | Mod: {item.modalidad} | Cantón: {item.canton} | Fac: {item.facultad}")
