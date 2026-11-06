from sqlalchemy import text
from app.core.database import engine

with engine.connect() as conn:
    print("=== INDEXES ON carreras_catalogo ===")
    res = conn.execute(text("""
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'carreras_catalogo';
    """))
    for row in res:
        print(f"{row[0]}: {row[1]}")
