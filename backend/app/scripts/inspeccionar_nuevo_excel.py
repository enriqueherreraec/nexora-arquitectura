import openpyxl
from collections import Counter

wb = openpyxl.load_workbook('../data/Universidades_publicas_Ecuador_2026.xlsx', data_only=True)

ws_u = wb['Universidades']
univs = {}
for r in range(7, ws_u.max_row+1):
    sigla = ws_u.cell(r, 1).value
    if sigla:
        sigla = str(sigla).strip()
        univs[sigla] = {
            'sigla': sigla,
            'nombre': str(ws_u.cell(r, 2).value or '').strip(),
            'provincia': str(ws_u.cell(r, 3).value or '').strip(),
            'ciudad': str(ws_u.cell(r, 4).value or '').strip(),
            'estado': str(ws_u.cell(r, 5).value or '').strip(),
            'registros': ws_u.cell(r, 6).value,
            'alcance': str(ws_u.cell(r, 7).value or '').strip(),
            'portal': str(ws_u.cell(r, 9).value or '').strip(),
            'ces': str(ws_u.cell(r, 10).value or '').strip(),
        }

ws_c = wb['Carreras']
carreras = []
for r in range(7, ws_c.max_row+1):
    sigla = ws_c.cell(r, 1).value
    carr = ws_c.cell(r, 4).value
    if sigla and carr:
        sigla = str(sigla).strip()
        carreras.append({
            'row': r,
            'sigla': sigla,
            'univ': str(ws_c.cell(r, 2).value or '').strip(),
            'facultad': str(ws_c.cell(r, 3).value or '').strip(),
            'carrera': str(carr).strip(),
            'periodo': str(ws_c.cell(r, 5).value or '').strip(),
            'estado': str(ws_c.cell(r, 6).value or '').strip(),
            'observaciones': str(ws_c.cell(r, 7).value or '').strip(),
            'fuente': str(ws_c.cell(r, 9).value or '').strip(),
        })

print(f"Total universidades en hoja Universidades: {len(univs)}")
print(f"Total carreras en hoja Carreras: {len(carreras)}")

siglas_con_carreras = set(c['sigla'] for c in carreras)
print(f"\n--- Universidades con carreras ({len(siglas_con_carreras)}) ---")
for s in sorted(siglas_con_carreras):
    cnt = len([c for c in carreras if c['sigla'] == s])
    facs = len(set(c['facultad'] for c in carreras if c['sigla'] == s))
    u = univs.get(s, {})
    print(f"  {s:<12} | {u.get('nombre', '')[:40]:<40} | {cnt:>2} carreras | {facs:>2} facultades | {u.get('ciudad', '')}, {u.get('provincia', '')}")

siglas_sin_carreras = set(univs.keys()) - siglas_con_carreras
print(f"\n--- Universidades con 0 carreras en este Excel ({len(siglas_sin_carreras)}) ---")
for s in sorted(siglas_sin_carreras):
    u = univs[s]
    print(f"  {s:<12} | {u.get('nombre', '')[:40]:<40} | Estado: {u.get('estado', '')}")
