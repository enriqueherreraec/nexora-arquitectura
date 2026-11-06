import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.modules.catalogo.models import CarreraCatalogo
import openpyxl

db = SessionLocal()

# Compare UTMACH in DB vs Excel
carreras_utmach_db = db.query(CarreraCatalogo).filter(CarreraCatalogo.siglas == 'UTMACH').all()
print(f"UTMACH DB total: {len(carreras_utmach_db)}")
print(f"UTMACH DB vigentes: {len([c for c in carreras_utmach_db if c.es_vigente])}")
print(f"UTMACH DB no vigentes: {len([c for c in carreras_utmach_db if not c.es_vigente])}")

# Let's inspect some of the UTMACH records
for c in carreras_utmach_db[:15]:
    print(f"ID: {c.id:4d} | Vig: {c.es_vigente} | Cod: {c.codigo_oferta} | Fac: {c.facultad!r} | Mod: {c.modalidad} | Carr: {c.nombre}")

print("\n--- UNEMI ---")
carreras_unemi_db = db.query(CarreraCatalogo).filter(CarreraCatalogo.siglas == 'UNEMI').all()
print(f"UNEMI DB total: {len(carreras_unemi_db)}")
print(f"UNEMI DB vigentes: {len([c for c in carreras_unemi_db if c.es_vigente])}")
print(f"UNEMI DB no vigentes: {len([c for c in carreras_unemi_db if not c.es_vigente])}")
for c in carreras_unemi_db[:15]:
    print(f"ID: {c.id:4d} | Vig: {c.es_vigente} | Cod: {c.codigo_oferta} | Fac: {c.facultad!r} | Mod: {c.modalidad} | Carr: {c.nombre}")
