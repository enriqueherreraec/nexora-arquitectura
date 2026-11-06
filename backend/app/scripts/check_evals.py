import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import inspect
from app.core.database import engine, SessionLocal
from sqlalchemy import text

insp = inspect(engine)
cols = insp.get_columns('evaluaciones')
print("evaluaciones columns:", [c['name'] for c in cols])

db = SessionLocal()
res = db.execute(text("SELECT id, usuario_id, perfil_id, created_at, top_carreras FROM evaluaciones LIMIT 5")).fetchall()
for r in res:
    print(r)
