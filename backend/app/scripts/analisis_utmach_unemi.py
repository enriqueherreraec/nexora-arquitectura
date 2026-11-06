from app.core.database import SessionLocal
from app.modules.catalogo.models import CarreraCatalogo
from sqlalchemy import func

db = SessionLocal()

for sigla in ['UTMACH', 'UNEMI']:
    print(f"\n==================== {sigla} ====================")
    todas = db.query(CarreraCatalogo).filter(CarreraCatalogo.siglas == sigla).all()
    print(f"Total registros en DB: {len(todas)}")
    grado = [c for c in todas if c.es_tercer_nivel]
    posgrado = [c for c in todas if c.es_posgrado]
    print(f"Ofertas de Grado: {len(grado)} | Posgrado: {len(posgrado)}")
    
    unicas_grado = sorted(list(set(c.nombre for c in grado)))
    print(f"Carreras únicas de Grado: {len(unicas_grado)}")
    
    vigentes_grado = [c for c in grado if c.es_vigente]
    unicas_vigentes_grado = sorted(list(set(c.nombre for c in vigentes_grado)))
    print(f"Ofertas vigentes de Grado: {len(vigentes_grado)} | Carreras únicas vigentes de Grado: {len(unicas_vigentes_grado)}")
    
    print("\nDetalle de Carreras de Grado Vigentes:")
    for nom in unicas_vigentes_grado:
        ofertas = [c for c in vigentes_grado if c.nombre == nom]
        mods = sorted(list(set(c.modalidad for c in ofertas)))
        sedes = sorted(list(set(c.canton for c in ofertas if c.canton)))
        facs = sorted(list(set(c.facultad for c in ofertas if c.facultad)))
        cods = [c.codigo_oferta or str(c.id) for c in ofertas]
        print(f"  * {nom}")
        print(f"    - Facultades en DB: {facs or ['SIN FACULTAD']}")
        print(f"    - Modalidades: {mods} | Sedes: {sedes} | Códigos: {cods}")

    historicas_grado = [c for c in grado if not c.es_vigente]
    unicas_historicas = sorted(list(set(c.nombre for c in historicas_grado if c.nombre not in unicas_vigentes_grado)))
    print(f"\nCarreras de Grado Históricas (no vigentes en oferta actual) ({len(unicas_historicas)} únicas):")
    for nom in unicas_historicas:
        ofertas = [c for c in historicas_grado if c.nombre == nom]
        facs = sorted(list(set(c.facultad for c in ofertas if c.facultad)))
        print(f"  * [Histórica] {nom} (facultad DB: {facs or ['SIN FACULTAD']})")
