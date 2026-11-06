import openpyxl

wb = openpyxl.load_workbook('../Nexora_Universidades_Publicas_Ecuador_2026-10-13.xlsx', data_only=True)
ws = wb['Carreras']

print("=== UNEMI EN EXCEL ===")
for r in ws.iter_rows(min_row=7, values_only=True):
    sigla = str(r[2] or '').strip().upper()
    if sigla == 'UNEMI':
        cod = str(r[0] or '').strip()
        carr = str(r[4] or '').strip()
        fac = str(r[6] or '').strip()
        respaldo = str(r[7] or '').strip()
        mod = str(r[9] or '').strip()
        cant = str(r[11] or '').strip()
        print(f"[{cod}] {carr} | Mod: {mod} | Cant: {cant} | Fac: {fac} | Respaldo: {respaldo}")
