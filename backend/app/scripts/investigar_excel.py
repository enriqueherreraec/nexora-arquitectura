import openpyxl
from collections import Counter

wb = openpyxl.load_workbook('../Nexora_Universidades_Publicas_Ecuador_2026-10-13.xlsx', data_only=True)
ws = wb['Carreras']

# Let's inspect rows
rows = list(ws.iter_rows(min_row=7, values_only=True))
print(f"Total filas en Carreras del Excel: {len(rows)}")

facs_by_uni = {}
carreras_excel_sin_fac = []

for r in rows:
    sigla = str(r[2] or '').strip().upper()
    carr = str(r[4] or '').strip()
    fac = str(r[6] or '').strip()
    respaldo = str(r[7] or '').strip()
    fuente_fac = str(r[24] or '').strip()
    
    if sigla not in facs_by_uni:
        facs_by_uni[sigla] = Counter()
    facs_by_uni[sigla][fac] += 1
    
    if not fac or 'no verificada' in fac.lower() or 'el reporte ces no incluye' in respaldo.lower():
        carreras_excel_sin_fac.append((sigla, carr, fac, respaldo, fuente_fac))

print(f"Filas en Excel sin facultad o no verificada: {len(carreras_excel_sin_fac)}")
print("\nDesglose por universidad en el Excel:")
for sigla in sorted(facs_by_uni.keys()):
    tot = sum(facs_by_uni[sigla].values())
    facs = facs_by_uni[sigla]
    print(f"\n--- {sigla} (Total en Excel: {tot}) ---")
    for f, c in facs.items():
        print(f"    {f}: {c}")
