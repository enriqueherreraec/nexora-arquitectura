import os
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.modules.catalogo.models import CarreraCatalogo
from sqlalchemy import func

db = SessionLocal()

SIGLAS_33 = [
    'EPN', 'ESPOCH', 'ESPAM MFL', 'UCE', 'UG', 'UCUENCA', 'UNL', 'UTM', 'UTA',
    'UTMACH', 'UTELVT', 'UTB', 'UTEQ', 'UTN', 'ULEAM', 'UEB', 'UAE', 'UNACH',
    'UTC', 'ESPOL', 'UPSE', 'UNEMI', 'UNESUM', 'UEA', 'UINPIAW', 'UPEC', 'ESPE',
    'IKIAM', 'UITEY', 'UARTES', 'UNAE', 'USECIPOL', 'UPSDT'
]

print(f"=== VERIFICACIÓN DE LAS 33 UNIVERSIDADES PÚBLICAS ===")
total_ofertas_gral = 0
total_carreras_unicas_gral = 0

for sigla in SIGLAS_33:
    carreras = db.query(CarreraCatalogo).filter(
        CarreraCatalogo.siglas == sigla,
        CarreraCatalogo.es_vigente == True
    ).all()
    unicas = set(c.nombre for c in carreras)
    facs = sorted(list(set(c.facultad for c in carreras if c.facultad and 'no verificada' not in c.facultad.lower() and 'no especificada' not in c.facultad.lower() and c.facultad != 'Unidad Académica Institucional')))
    sin_fac = [c for c in carreras if not c.facultad or 'no verificada' in c.facultad.lower() or 'no especificada' in c.facultad.lower() or c.facultad == 'Unidad Académica Institucional']
    
    total_ofertas_gral += len(carreras)
    total_carreras_unicas_gral += len(unicas)
    
    print(f"{sigla:12s} | Ofertas: {len(carreras):3d} | Carreras únicas: {len(unicas):3d} | Facultades válidas: {len(facs):2d} | Pendientes: {len(sin_fac):2d}")
    if sin_fac:
        for sf in sin_fac[:3]:
            print(f"    PENDIENTE: {sf.nombre} (ID: {sf.id}, Cod: {sf.codigo_oferta})")

print(f"\nTOTAL GENERAL: {total_ofertas_gral} ofertas vigentes | {total_carreras_unicas_gral} carreras únicas")
