from sqlalchemy import text
from app.core.database import engine

with engine.connect() as conn:
    print("=== EXPLAIN ANALYZE: Carreras por defecto (facultad, nombre, modalidad) ===")
    res = conn.execute(text("""
        EXPLAIN ANALYZE
        SELECT * FROM carreras_catalogo
        WHERE es_vigente = true AND es_tercer_nivel = true
        ORDER BY facultad ASC NULLS LAST, nombre ASC, modalidad ASC, codigo_oferta ASC NULLS LAST
        LIMIT 24 OFFSET 0;
    """))
    for row in res:
        print(row[0])

    print("\n=== EXPLAIN ANALYZE: Universidades con agregaciones ===")
    res = conn.execute(text("""
        EXPLAIN ANALYZE
        SELECT siglas, COUNT(id)
        FROM carreras_catalogo
        WHERE es_vigente = true
        GROUP BY siglas;
    """))
    for row in res:
        print(row[0])
