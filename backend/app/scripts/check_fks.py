import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import inspect
from app.core.database import engine

insp = inspect(engine)
tables = insp.get_table_names()
print("Tables in DB:", tables)

for t in tables:
    fks = insp.get_foreign_keys(t)
    for fk in fks:
        if fk.get('referred_table') == 'carreras_catalogo':
            print(f"Table '{t}' has FK to carreras_catalogo: {fk}")
