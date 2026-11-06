import os
import sys
from pathlib import Path
from collections import Counter, defaultdict

backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.modules.catalogo.models import CarreraCatalogo
from app.modules.catalogo.data import UNIVERSIDADES_PUBLICAS

db = SessionLocal()

print(f"=== UNIVERSIDADES_PUBLICAS EN data.py ({len(UNIVERSIDADES_PUBLICAS)}) ===")
unis_catalogo = [u["siglas"] for u in UNIVERSIDADES_PUBLICAS]
print(unis_catalogo)

print("\n=== TOTAL EN DB POR SIGLAS DE UNIVERSIDADES_PUBLICAS ===")
for u in UNIVERSIDADES_PUBLICAS:
    sigla = u["siglas"]
    carrs = db.query(CarreraCatalogo).filter(CarreraCatalogo.siglas == sigla).all()
    vigentes = [c for c in carrs if c.es_vigente]
    facultades = set(c.facultad for c in carrs if c.facultad and "no verificada" not in c.facultad.lower() and "no especificada" not in c.facultad.lower())
    sin_fac = [c for c in carrs if not c.facultad or "no verificada" in c.facultad.lower() or "no especificada" in c.facultad.lower()]
    nombres_unicos = set(c.nombre for c in carrs)
    print(f"{sigla:10s} | Ofertas: {len(carrs):3d} (Vig: {len(vigentes):3d}) | Carreras únicas: {len(nombres_unicos):3d} | Facs válidas: {len(facultades):2d} | Sin Fac: {len(sin_fac):3d}")

print("\n=== UNIVERSIDADES QUE APARECEN EN router.py (GET /catalogo/universidades) ===")
# Let's inspect rows from router.py logic
rows = (
    db.query(
        CarreraCatalogo.siglas,
        CarreraCatalogo.institucion,
    )
    .filter(CarreraCatalogo.tipo_financiamiento.ilike("%P_BLICA%"))
    .filter(CarreraCatalogo.siglas.isnot(None))
    .distinct(CarreraCatalogo.siglas)
    .all()
)
print("Siglas en DB con financiamiento pública:", [r[0] for r in rows if r[0]])
