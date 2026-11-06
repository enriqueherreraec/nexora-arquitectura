import openpyxl
from collections import defaultdict

wb = openpyxl.load_workbook('../Nexora_Universidades_Publicas_Ecuador_2026-10-13.xlsx', data_only=True)
ws = wb['Carreras']

unverified_by_uni = defaultdict(list)
verified_by_uni = defaultdict(set)

for r in ws.iter_rows(min_row=7, values_only=True):
    cod = str(r[0] or '').strip()
    sigla = str(r[2] or '').strip().upper()
    carr = str(r[4] or '').strip()
    fac = str(r[6] or '').strip()
    mod = str(r[9] or '').strip()
    cant = str(r[11] or '').strip()
    
    if not fac or 'no verificada' in fac.lower():
        unverified_by_uni[sigla].append((cod, carr, mod, cant))
    else:
        verified_by_uni[sigla].add(fac)

print("=== RESUMEN DE CARRERAS SIN FACULTAD EN EXCEL ===")
for sigla in sorted(unverified_by_uni.keys()):
    carrs = unverified_by_uni[sigla]
    unique_carrs = sorted(list(set(c[1] for c in carrs)))
    facs_existentes = sorted(list(verified_by_uni[sigla]))
    print(f"\n{sigla} (Total ofertas pendientes: {len(carrs)} | Carreras únicas pendientes: {len(unique_carrs)})")
    print(f"  Facultades ya verificadas en el archivo: {facs_existentes}")
    print(f"  Carreras únicas pendientes: {unique_carrs}")
