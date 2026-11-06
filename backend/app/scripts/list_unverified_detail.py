import openpyxl
from collections import defaultdict

wb = openpyxl.load_workbook('../Nexora_Universidades_Publicas_Ecuador_2026-10-13.xlsx', data_only=True)
ws = wb['Carreras']

# Let's inspect each university that has unverified offers
unverified = defaultdict(list)
for r in ws.iter_rows(min_row=7, values_only=True):
    sigla = str(r[2] or '').strip().upper()
    carr = str(r[4] or '').strip()
    fac = str(r[6] or '').strip()
    cod = str(r[0] or '').strip()
    if not fac or 'no verificada' in fac.lower():
        unverified[sigla].append((cod, carr))

for sigla in sorted(unverified.keys()):
    carrs = sorted(list(set(c[1] for c in unverified[sigla])))
    print(f"=== {sigla} ({len(carrs)} carreras distintas sin facultad) ===")
    for c in carrs:
        print(f"  - {c}")
