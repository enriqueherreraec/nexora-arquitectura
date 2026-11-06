import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# 1. Test /catalogo/universidades
r_u = client.get('/api/v1/catalogo/universidades')
assert r_u.status_code == 200
univs = r_u.json()
print(f"GET /catalogo/universidades OK: {len(univs)} universidades devueltas.")

for u in univs[:8]:
    print(f"  {u['siglas']:10s} | {u['nombre'][:35]:35s} | Carreras: {u['total_carreras']:2d} | Facultades: {u['total_facultades']:2d}")

# Verificar UTMACH
u_utmach = next(u for u in univs if u['siglas'] == 'UTMACH')
print(f"\nUTMACH: total_carreras={u_utmach['total_carreras']}, facultades={len(u_utmach['facultades'])}")
assert u_utmach['total_carreras'] == 30
assert len(u_utmach['facultades']) == 5

# Verificar UNEMI
u_unemi = next(u for u in univs if u['siglas'] == 'UNEMI')
print(f"UNEMI: total_carreras={u_unemi['total_carreras']}, facultades={len(u_unemi['facultades'])}")
assert u_unemi['total_carreras'] == 25
assert len(u_unemi['facultades']) == 4

# 2. Test /catalogo/carreras
r_c = client.get('/api/v1/catalogo/carreras')
assert r_c.status_code == 200
carrs = r_c.json()
print(f"\nGET /catalogo/carreras OK: {len(carrs)} carreras activas devueltas.")
assert len(carrs) == 510, f"Se esperaban 510 carreras activas pero se obtuvieron {len(carrs)}"

# 3. Test carreras UTMACH
r_cutmach = client.get('/api/v1/catalogo/carreras', params={'siglas': 'UTMACH'})
assert r_cutmach.status_code == 200
carrs_utmach = r_cutmach.json()
print(f"Carreras UTMACH: {len(carrs_utmach)} devueltas (Esperado: 30).")
assert len(carrs_utmach) == 30

# 4. Test carreras UNEMI
r_cunemi = client.get('/api/v1/catalogo/carreras', params={'siglas': 'UNEMI'})
assert r_cunemi.status_code == 200
carrs_unemi = r_cunemi.json()
print(f"Carreras UNEMI: {len(carrs_unemi)} devueltas (Esperado: 25).")
assert len(carrs_unemi) == 25

# 5. Test búsqueda con y sin tildes
r_b1 = client.get('/api/v1/catalogo/carreras', params={'search': 'medicina'})
assert r_b1.status_code == 200
print(f"Búsqueda 'medicina': {len(r_b1.json())} ofertas encontradas.")

r_b2 = client.get('/api/v1/catalogo/carreras', params={'search': 'administración'})
r_b3 = client.get('/api/v1/catalogo/carreras', params={'search': 'administracion'})
assert len(r_b2.json()) == len(r_b3.json())
print(f"Búsqueda 'administración' vs 'administracion': ambos devuelven {len(r_b2.json())} ofertas.")

print("\n¡TODAS LAS VERIFICACIONES DE ENDPOINTS PASARON CON ÉXITO!")
