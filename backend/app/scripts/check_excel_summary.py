import os
import sys
from pathlib import Path
from collections import defaultdict

backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

import openpyxl
from app.core.database import SessionLocal
from app.modules.catalogo.models import CarreraCatalogo
from app.modules.catalogo.utils import remover_tildes

wb = openpyxl.load_workbook('../Nexora_Universidades_Publicas_Ecuador_2026-10-13.xlsx', data_only=True)
ws = wb['Carreras']

excel_offers = []
for r in ws.iter_rows(min_row=7, values_only=True):
    cod = str(r[0] or '').strip()
    ies_cod = str(r[1] or '').strip()
    sigla = str(r[2] or '').strip().upper()
    univ = str(r[3] or '').strip()
    carr = str(r[4] or '').strip()
    titulo = str(r[5] or '').strip()
    fac = str(r[6] or '').strip()
    respaldo = str(r[7] or '').strip()
    campo_ces = str(r[8] or '').strip()
    mod = str(r[9] or '').strip()
    prov = str(r[10] or '').strip()
    cant = str(r[11] or '').strip()
    lugar = str(r[12] or '').strip()
    semestres = str(r[13] or '').strip()
    web = str(r[27] or '').strip()
    excel_offers.append({
        "cod": cod, "ies_cod": ies_cod, "sigla": sigla, "univ": univ,
        "carr": carr, "titulo": titulo, "fac": fac, "respaldo": respaldo,
        "campo_ces": campo_ces, "mod": mod, "prov": prov, "cant": cant,
        "lugar": lugar, "semestres": semestres, "web": web
    })

print(f"Total ofertas leídas de Excel: {len(excel_offers)}")

by_uni = defaultdict(list)
for o in excel_offers:
    by_uni[o["sigla"]].append(o)

print(f"Total universidades en Excel: {len(by_uni)}")
for sigla, offers in sorted(by_uni.items()):
    unverified = [o for o in offers if not o["fac"] or "no verificada" in o["fac"].lower()]
    unique_carrs = len(set(o["carr"] for o in offers))
    print(f"  {sigla:12s} | Ofertas: {len(offers):3d} | Carreras únicas: {unique_carrs:2d} | Sin fac: {len(unverified):2d}")
