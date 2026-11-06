from typing import List, Optional
from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, String, func

from app.core.database import get_db
from app.modules.catalogo.models import CarreraCatalogo
from app.modules.catalogo.data import OFERTA_CARRERAS, UNIVERSIDADES_PUBLICAS
from app.modules.catalogo.utils import remover_tildes

router = APIRouter(prefix="/catalogo", tags=["Catálogo Académico IES Públicas"])


@router.get("/universidades", summary="Listar Universidades y Escuelas Politécnicas Públicas")
def listar_universidades(
    search: Optional[str] = Query(None, description="Buscar por nombre o sigla"),
    provincia: Optional[str] = Query(None, description="Filtrar por provincia"),
    ciudad: Optional[str] = Query(None, description="Filtrar por cantón o ciudad"),
    db: Session = Depends(get_db),
):
    search_str = search if isinstance(search, str) and search.strip() else None
    prov_str = provincia if isinstance(provincia, str) and provincia != "Todas" else None
    ciudad_str = ciudad if isinstance(ciudad, str) and ciudad != "Todas" else None

    try:
        dict_verificado = {u["siglas"].upper(): u for u in UNIVERSIDADES_PUBLICAS}
        siglas_oficiales = set(dict_verificado.keys())

        # Agrupar información de las universidades públicas con oferta activa por sigla
        rows = (
            db.query(
                CarreraCatalogo.siglas,
                func.max(CarreraCatalogo.institucion).label("nombre"),
                func.max(CarreraCatalogo.tipo_ies).label("tipo"),
                func.max(CarreraCatalogo.provincia).label("prov_db"),
                func.max(CarreraCatalogo.canton).label("canton_db"),
                func.array_agg(func.distinct(CarreraCatalogo.provincia)).label("provincias"),
                func.array_agg(func.distinct(CarreraCatalogo.canton)).label("cantones"),
                func.array_agg(func.distinct(CarreraCatalogo.facultad)).label("facultades"),
                func.count(func.distinct(CarreraCatalogo.nombre)).label("total_carreras_unicas"),
                func.count(CarreraCatalogo.id).label("total_ofertas"),
            )
            .filter(func.upper(CarreraCatalogo.siglas).in_(siglas_oficiales))
            .filter(CarreraCatalogo.es_vigente == True)
            .group_by(CarreraCatalogo.siglas)
            .order_by(func.count(CarreraCatalogo.id).desc())
            .all()
        )

        dict_rows = {r.siglas.strip().upper(): r for r in rows}
        lista = []

        # Recorrer las 33 universidades públicas de grado para incluir tanto las que tienen
        # carreras verificadas en el nuevo Excel como las que están con catálogo pendiente
        for u in UNIVERSIDADES_PUBLICAS:
            sigla = u["siglas"].strip()
            r = dict_rows.get(sigla.upper())

            if r:
                provs = [p for p in (r.provincias or []) if p]
                cants = [c for c in (r.cantones or []) if c]
                facs = sorted([
                    f for f in set(r.facultades or [])
                    if f and 'no verificada' not in f.lower() and 'no especificada' not in f.lower() and f != 'Unidad Académica Institucional'
                ])
                total_ofertas = r.total_ofertas
                total_unicas = r.total_carreras_unicas
                prov_matriz = u.get("provincia_matriz") or r.prov_db or "No especificada"
                ciudad_matriz = u.get("ciudad_matriz") or r.canton_db or prov_matriz
                nombre_oficial = u.get("nombre") or r.nombre
                desc = u.get("descripcion") or f"Institución pública de educación superior registrada en el catálogo oficial con {total_unicas} carreras."
            else:
                prov_matriz = u.get("provincia_matriz", "No especificada")
                ciudad_matriz = u.get("ciudad_matriz", "No especificada")
                provs = [prov_matriz] if prov_matriz != "No especificada" else []
                cants = [ciudad_matriz] if ciudad_matriz != "No especificada" else []
                facs = []
                total_ofertas = 0
                total_unicas = 0
                nombre_oficial = u.get("nombre", sigla)
                desc = "Institución pública de educación superior (CES). Catálogo pendiente de incorporar."

            total_reg = total_unicas
            estado_cat = "INCORPORADO" if total_unicas > 0 else "PENDIENTE_INCORPORAR"
            etiqueta_cat = f"{total_unicas} carreras" if total_unicas > 0 else "Catálogo pendiente de incorporar"

            item = {
                "id": sigla,
                "siglas": sigla,
                "nombre": nombre_oficial,
                "tipo": u.get("tipo") or "Universidad Pública",
                "provincia_matriz": prov_matriz,
                "ciudad_matriz": ciudad_matriz,
                "ubicaciones_ofertas": cants,
                "provincias": provs,
                "ciudades": cants,
                "total_carreras": total_unicas,
                "total_carreras_unicas": total_unicas,
                "total_ofertas": total_ofertas,
                "facultades": facs,
                "total_facultades": len(facs),
                "sitio_web": u.get("sitio_web") or "Información no disponible",
                "descripcion": desc,
                "estado_catalogo": estado_cat,
                "etiqueta_catalogo": etiqueta_cat,
                "fuente_verificacion": u.get("fuente_verificacion") or "Catálogo Oficial CES / LOES 2026",
                "fecha_verificacion": u.get("fecha_verificacion") or "2026-10",
                "lat": u.get("lat"),
                "lon": u.get("lon"),
            }

            if search_str:
                s_norm = remover_tildes(search_str)
                if s_norm not in remover_tildes(item["nombre"]) and s_norm not in remover_tildes(item["siglas"]):
                    continue

            if prov_str:
                p_norm = remover_tildes(prov_str)
                if p_norm != remover_tildes(item["provincia_matriz"]) and not any(p_norm == remover_tildes(p) for p in provs):
                    continue

            if ciudad_str:
                c_norm = remover_tildes(ciudad_str)
                if c_norm != remover_tildes(item["ciudad_matriz"]) and not any(c_norm == remover_tildes(c) for c in cants):
                    continue

            lista.append(item)

        # Ordenar: instituciones con oferta activa primero (descendente por total de carreras), luego alfabéticamente
        lista.sort(key=lambda x: (-x["total_carreras"], x["nombre"]))

        if lista:
            return lista
    except Exception:
        pass

    fallback_list = []
    for u in UNIVERSIDADES_PUBLICAS:
        item = {
            "id": u.get("id") or u["siglas"],
            "siglas": u["siglas"],
            "nombre": u["nombre"],
            "tipo": u.get("tipo", "Universidad Pública"),
            "provincia_matriz": u.get("provincia_matriz", "No especificada"),
            "ciudad_matriz": u.get("ciudad_matriz", "No especificada"),
            "ubicaciones_ofertas": [u.get("ciudad_matriz", "")],
            "provincias": [u.get("provincia_matriz", "")],
            "ciudades": [u.get("ciudad_matriz", "")],
            "total_carreras": 0,
            "facultades": [],
            "total_facultades": 0,
            "sitio_web": u.get("sitio_web", "Información no disponible"),
            "descripcion": u.get("descripcion", "Institución pública de educación superior del Ecuador."),
            "fuente_verificacion": u.get("fuente_verificacion", "Catálogo Oficial CES / LOES"),
            "fecha_verificacion": u.get("fecha_verificacion", "2026-10"),
            "lat": u.get("lat"),
            "lon": u.get("lon"),
        }
        if search_str:
            s_norm = remover_tildes(search_str)
            if s_norm not in remover_tildes(item["nombre"]) and s_norm not in remover_tildes(item["siglas"]):
                continue
        if prov_str:
            if remover_tildes(prov_str) != remover_tildes(item["provincia_matriz"]):
                continue
        if ciudad_str:
            if remover_tildes(ciudad_str) != remover_tildes(item["ciudad_matriz"]):
                continue
        fallback_list.append(item)
    return fallback_list


@router.get("/universidades/{siglas_o_id}", summary="Detalle de una universidad pública")
def obtener_universidad(siglas_o_id: str, db: Session = Depends(get_db)):
    univs = listar_universidades(search=None, provincia=None, ciudad=None, db=db)
    buscado = siglas_o_id.strip().upper()
    for u in univs:
        if u["siglas"].upper() == buscado or u["id"].upper() == buscado:
            return u
    raise HTTPException(status_code=404, detail=f"Universidad '{siglas_o_id}' no encontrada en el catálogo.")


@router.get("/carreras", summary="Consultar oferta de carreras con filtros oficiales y áreas")
def listar_carreras(
    siglas: Optional[str] = Query(None, description="Filtrar por siglas de la institución (ej. UTMACH, UNEMI)"),
    institucion: Optional[str] = Query(None, description="Filtrar por nombre de la institución"),
    area: Optional[str] = Query(None, description="Filtrar por área vocacional o del conocimiento"),
    provincia: Optional[str] = Query(None, description="Filtrar por provincia"),
    modalidad: Optional[str] = Query(None, description="Filtrar por modalidad"),
    search: Optional[str] = Query(None, description="Buscar por carrera, universidad, sigla, facultad o código"),
    nivel: Optional[str] = Query(None, description="Filtrar por nivel: 'tercer_nivel', 'posgrado', o 'todos'"),
    vigente: Optional[bool] = Query(True, description="Filtrar solo ofertas vigentes"),
    limit: int = Query(1000, ge=1, le=20000, description="Límite de resultados retornados"),
    offset: int = Query(0, ge=0, description="Desplazamiento para paginación"),
    db: Session = Depends(get_db),
):
    siglas_str = siglas if isinstance(siglas, str) and siglas != "Todas" else None
    inst_str = institucion if isinstance(institucion, str) and institucion != "Todas" else None
    area_str = area if isinstance(area, str) and area != "Todas" else None
    prov_str = provincia if isinstance(provincia, str) and provincia != "Todas" else None
    mod_str = modalidad if isinstance(modalidad, str) and modalidad != "Todas" else None
    search_str = search if isinstance(search, str) and search.strip() else None
    nivel_str = nivel if isinstance(nivel, str) else None
    vig_bool = vigente if isinstance(vigente, bool) else None

    try:
        query = db.query(CarreraCatalogo)

        if siglas_str:
            query = query.filter(func.upper(CarreraCatalogo.siglas) == siglas_str.strip().upper())

        if inst_str:
            query = query.filter(CarreraCatalogo.institucion_normalizada.ilike(f"%{remover_tildes(inst_str)}%"))

        if area_str:
            query = query.filter(
                or_(
                    CarreraCatalogo.area_vocacional == area_str,
                    CarreraCatalogo.areas_vocacionales.cast(String).ilike(f"%{area_str}%")
                )
            )

        if prov_str:
            prov_norm = remover_tildes(prov_str)
            query = query.filter(CarreraCatalogo.provincia_normalizada == prov_norm)

        if mod_str:
            mod_norm = remover_tildes(mod_str)
            query = query.filter(CarreraCatalogo.modalidad_normalizada.ilike(f"%{mod_norm}%"))

        if nivel_str == "posgrado":
            query = query.filter(CarreraCatalogo.es_posgrado == True)
        elif nivel_str == "todos":
            pass
        else:
            # Por defecto grado / tercer nivel
            query = query.filter(CarreraCatalogo.es_tercer_nivel == True)

        if vig_bool is not None:
            query = query.filter(CarreraCatalogo.es_vigente == vig_bool)
        else:
            query = query.filter(CarreraCatalogo.es_vigente == True)

        if search_str:
            s_raw = search_str.strip()
            s_norm = remover_tildes(s_raw)
            query = query.filter(
                or_(
                    CarreraCatalogo.nombre_normalizado.ilike(f"%{s_norm}%"),
                    CarreraCatalogo.institucion_normalizada.ilike(f"%{s_norm}%"),
                    CarreraCatalogo.siglas.ilike(f"%{s_raw}%"),
                    CarreraCatalogo.canton_normalizado.ilike(f"%{s_norm}%"),
                    CarreraCatalogo.provincia_normalizada.ilike(f"%{s_norm}%"),
                    CarreraCatalogo.facultad.ilike(f"%{s_norm}%"),
                    CarreraCatalogo.facultad.ilike(f"%{s_raw}%"),
                    CarreraCatalogo.codigo_oferta.ilike(f"%{s_raw}%"),
                )
            )

        query = query.order_by(
            CarreraCatalogo.facultad.asc().nullslast(),
            CarreraCatalogo.nombre.asc(),
            CarreraCatalogo.modalidad.asc(),
            CarreraCatalogo.codigo_oferta.asc().nullslast()
        )

        lim = limit if isinstance(limit, int) else 500
        off = offset if isinstance(offset, int) else 0

        carreras_db = query.offset(off).limit(lim).all()

        if carreras_db:
            return [c.to_dict() for c in carreras_db]

    except Exception as e:
        pass

    # Fallback estático en caso de desconexión temporal
    lim = limit if isinstance(limit, int) else 500
    off = offset if isinstance(offset, int) else 0
    resultados = OFERTA_CARRERAS
    if area and area != "Todas":
        resultados = [c for c in resultados if c.get("area_vocacional") == area]
    if provincia and provincia != "Todas":
        resultados = [c for c in resultados if remover_tildes(c.get("provincia", "")) == remover_tildes(provincia)]
    if modalidad and modalidad != "Todas":
        resultados = [c for c in resultados if remover_tildes(c.get("modalidad", "")) == remover_tildes(modalidad)]
    if search:
        s = remover_tildes(search)
        resultados = [
            c for c in resultados
            if s in remover_tildes(c.get("nombre", ""))
            or s in remover_tildes(c.get("institucion", ""))
            or s in remover_tildes(c.get("siglas", ""))
        ]
    return resultados[off : off + lim]
