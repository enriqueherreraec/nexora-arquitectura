import openpyxl

wb = openpyxl.load_workbook('../data/Universidades_publicas_Ecuador_2026.xlsx')
ws_u = wb['Universidades']
h_u = [c.value for c in ws_u[6]]
rows = [dict(zip(h_u, r)) for r in ws_u.iter_rows(min_row=7, values_only=True) if any(r)]

ws_c = wb['Carreras']
c_counts = {}
for r in ws_c.iter_rows(min_row=7, values_only=True):
    if any(r):
        sigla = r[0]
        c_counts[sigla] = c_counts.get(sigla, 0) + 1

posgrados = [r for r in rows if r['Sigla'] in ['FLACSO', 'IAEN', 'UASB']]
activas = [r for r in rows if r['Sigla'] not in ['FLACSO', 'IAEN', 'UASB'] and c_counts.get(r['Sigla'], 0) > 0]
pend = [r for r in rows if r['Sigla'] not in ['FLACSO', 'IAEN', 'UASB'] and c_counts.get(r['Sigla'], 0) == 0]

print("=== 12 UNIVERSIDADES CON CATÁLOGO PENDIENTE DE INCORPORAR ===")
for idx, p in enumerate(pend, 1):
    sigla = p.get('Sigla')
    nombre = p.get('Universidad o institución')
    ciudad = p.get('Ciudad de matriz')
    prov = p.get('Provincia de matriz')
    print(f"{idx}. [{sigla}] {nombre} ({ciudad}, {prov})")

print("\n=== CONTEOS INDIVIDUALES DE TODAS LAS 21 UNIVERSIDADES ACTIVAS ===")
activas_sorted = sorted(activas, key=lambda x: c_counts[x['Sigla']], reverse=True)
top_11 = activas_sorted[:11]
resto_10 = activas_sorted[11:]

print("--- Top 11 Instituciones ---")
sum_top11 = 0
for a in top_11:
    s = a['Sigla']
    n = a.get('Universidad o institución')
    c = c_counts[s]
    sum_top11 += c
    print(f"  {s}: {c} carreras - {n}")
print(f"Subtotal Top 11: {sum_top11}")

print("\n--- Otras 10 IES (conteo individual) ---")
sum_resto10 = 0
for a in resto_10:
    s = a['Sigla']
    n = a.get('Universidad o institución')
    c = c_counts[s]
    sum_resto10 += c
    print(f"  {s}: {c} carreras - {n}")
print(f"Subtotal Otras 10 IES: {sum_resto10}")

print(f"\nTotal general: {sum_top11} + {sum_resto10} = {sum_top11 + sum_resto10} carreras únicas (510)")
