from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, text, case
from app.core.database import get_db
from app.modules.cuentas.models import Usuario
from app.modules.cuentas.dependencies import require_gestor_or_admin
from app.modules.catalogo.models import CarreraCatalogo
from app.modules.catalogo.utils import remover_tildes
from app.scripts.sincronizar_catalogo_excel_2026 import clasificar_10_areas_vocal
from app.scripts.importar_catalogo_ces_2026 import CANTON_COORDS
from app.modules.gestor.schemas import (
    GestorResumenResponse,
    CarreraCrearRequest,
    CarreraActualizarRequest,
    CarreraCambiarEstadoRequest,
    FacultadRenombrarRequest,
    FacultadItemResponse,
)

router = APIRouter(prefix="/gestor", tags=["Panel del Gestor Académico"])


@router.get(
    "/resumen",
    response_model=GestorResumenResponse,
    summary="Resumen de métricas del catálogo académico (Gestor y Admin)"
)
def obtener_resumen_catalogo(
    gestor: Usuario = Depends(require_gestor_or_admin),
    db: Session = Depends(get_db),
):
    """
    Retorna métricas globales de universidades y carreras vigentes y activas del catálogo.
    Operación protegida para gestores académicos y administradores.
    """
    filtro_pendientes = or_(
        CarreraCatalogo.estado_verificacion == None,
        CarreraCatalogo.estado_verificacion.ilike("%pendiente%"),
        CarreraCatalogo.estado_verificacion.ilike("%por confirmar%"),
        CarreraCatalogo.facultad == None,
        CarreraCatalogo.facultad.ilike("%no especificada%"),
        CarreraCatalogo.facultad.ilike("%pendiente%"),
    )

    res = (
        db.query(
            func.count(func.distinct(CarreraCatalogo.siglas)).label("total_unis"),
            func.count(func.distinct(CarreraCatalogo.nombre)).label("total_unicas"),
            func.count(CarreraCatalogo.id).label("total_activas"),
            func.count(case((filtro_pendientes, 1), else_=None)).label("pendientes"),
        )
        .filter(CarreraCatalogo.es_vigente == True)
        .first()
    )

    total_unis = res.total_unis if res and res.total_unis else 0
    total_unicas = res.total_unicas if res and res.total_unicas else 0
    total_activas = res.total_activas if res and res.total_activas else 0
    pendientes = res.pendientes if res and res.pendientes else 0

    return GestorResumenResponse(
        total_universidades=total_unis,
        total_carreras_unicas=total_unicas,
        total_ofertas_activas=total_activas,
        total_carreras_inactivas=0,
        total_pendientes_verificacion=pendientes,
    )


@router.get(
    "/carreras",
    summary="Consultar carreras con filtros para gestión académica"
)
def listar_carreras_gestor(
    siglas: Optional[str] = Query(None, description="Filtrar por sigla (ej. UPEC, UNEMI)"),
    facultad: Optional[str] = Query(None, description="Filtrar por facultad"),
    modalidad: Optional[str] = Query(None, description="Filtrar por modalidad"),
    es_vigente: Optional[bool] = Query(None, description="Filtrar por estado activo/inactivo"),
    search: Optional[str] = Query(None, description="Buscar por nombre, código o título"),
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    gestor: Usuario = Depends(require_gestor_or_admin),
    db: Session = Depends(get_db),
):
    """
    Retorna la lista de carreras en el catálogo con opciones completas de filtrado.
    Permite visualizar tanto carreras activas como inactivas.
    """
    query = db.query(CarreraCatalogo)

    if es_vigente is not None:
        query = query.filter(CarreraCatalogo.es_vigente == es_vigente)
    else:
        query = query.filter(CarreraCatalogo.es_vigente == True)

    if siglas and siglas.strip() and siglas != "Todas":
        query = query.filter(func.upper(CarreraCatalogo.siglas) == siglas.strip().upper())

    if facultad and facultad.strip() and facultad != "Todas":
        query = query.filter(CarreraCatalogo.facultad.ilike(f"%{facultad.strip()}%"))

    if modalidad and modalidad.strip() and modalidad != "Todas":
        query = query.filter(CarreraCatalogo.modalidad_normalizada.ilike(f"%{remover_tildes(modalidad.strip()).lower()}%"))

    if search and search.strip():
        term = f"%{remover_tildes(search.strip()).lower()}%"
        query = query.filter(
            or_(
                CarreraCatalogo.nombre_normalizado.ilike(term),
                CarreraCatalogo.institucion_normalizada.ilike(term),
                CarreraCatalogo.codigo_oferta.ilike(term),
                CarreraCatalogo.facultad.ilike(term),
            )
        )

    total_count = query.count()
    carreras = query.order_by(CarreraCatalogo.siglas, CarreraCatalogo.facultad, CarreraCatalogo.nombre).offset(offset).limit(limit).all()

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "carreras": [c.to_dict() for c in carreras]
    }


@router.get(
    "/carreras/{carrera_id}",
    summary="Detalle de una carrera para edición"
)
def obtener_carrera_detalle(
    carrera_id: int,
    gestor: Usuario = Depends(require_gestor_or_admin),
    db: Session = Depends(get_db),
):
    carrera = db.query(CarreraCatalogo).filter(CarreraCatalogo.id == carrera_id).first()
    if not carrera:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Carrera {carrera_id} no encontrada.")
    return carrera.to_dict()


@router.post(
    "/carreras",
    status_code=status.HTTP_201_CREATED,
    summary="Crear una nueva carrera en el catálogo académico"
)
def crear_carrera(
    datos: CarreraCrearRequest,
    gestor: Usuario = Depends(require_gestor_or_admin),
    db: Session = Depends(get_db),
):
    """
    Crea un nuevo programa de carrera en el catálogo oficial en PostgreSQL.
    Valida contra duplicados y calcula automáticamente área vocacional y coordenadas.
    Registra quién realizó la creación y fecha.
    """
    nom = datos.nombre.strip()
    inst = datos.institucion.strip()
    sig = datos.siglas.strip().upper()
    fac = datos.facultad.strip()
    mod = datos.modalidad.strip()
    cant = datos.canton.strip()
    prov = datos.provincia.strip()

    # Comprobar duplicado vigente
    duplicado = db.query(CarreraCatalogo).filter(
        CarreraCatalogo.institucion_normalizada == remover_tildes(inst).lower(),
        CarreraCatalogo.nombre_normalizado == remover_tildes(nom).lower(),
        CarreraCatalogo.modalidad_normalizada == remover_tildes(mod).lower(),
        CarreraCatalogo.canton_normalizado == remover_tildes(cant).lower(),
        CarreraCatalogo.estado == "VIGENTE"
    ).first()

    if duplicado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe una oferta vigente de '{nom}' en '{inst}' ({mod}, {cant})."
        )

    # Determinar área vocacional
    areas = clasificar_10_areas_vocal(nom, fac)
    area_primaria = areas[0] if areas else "General"

    # Resolver coordenadas
    c_norm = remover_tildes(cant).lower()
    coords = CANTON_COORDS.get(c_norm, (-0.2106, -78.4891))

    ahora = datetime.now(timezone.utc)
    cod_oferta = f"NXR-{sig}-{int(ahora.timestamp()) % 100000:05d}"

    tipo_ies = "Escuela Politécnica Pública" if "POLIT" in inst.upper() or "EPN" in sig or "ESPOL" in sig or "ESPOCH" in sig else "Universidad Pública"

    nueva_carrera = CarreraCatalogo(
        codigo_oferta=cod_oferta,
        codigo_ies="OFI-CES",
        institucion=inst,
        institucion_normalizada=remover_tildes(inst).lower(),
        siglas=sig,
        tipo_ies=tipo_ies,
        tipo_financiamiento="PÚBLICA",
        nombre=nom,
        nombre_normalizado=remover_tildes(nom).lower(),
        titulo_otorga=datos.titulo_otorga or nom,
        facultad=fac,
        respaldo_facultad=datos.fuente_facultad or "Portal oficial institucional",
        campo_conocimiento_ces="Campo oficial CES",
        area_vocacional=area_primaria,
        areas_vocacionales=areas,
        nivel_formacion="Tercer Nivel / Grado",
        nivel_academico="Grado / Tercer Nivel",
        es_tercer_nivel=True,
        es_posgrado=False,
        modalidad=mod,
        modalidad_normalizada=remover_tildes(mod).lower(),
        provincia=prov,
        provincia_normalizada=remover_tildes(prov).lower(),
        canton=cant,
        canton_normalizado=remover_tildes(cant).lower(),
        campus=datos.campus or f"Campus {cant}",
        lugar_ejecucion="SEDE MATRIZ",
        estado="VIGENTE",
        es_vigente=True,
        duracion_semestres=datos.duracion_semestres,
        semestres_publicados=str(datos.duracion_semestres),
        modalidad_duracion="Semestral",
        puntaje_referencial=750,
        referencia_puntaje="Histórico Oficial SENESCYT",
        tipo_referencia="Referencia de Asignación",
        periodo_puntaje=datos.periodo_puntaje or "2026",
        puntaje_fuente="Histórico Oficial SENESCYT",
        puntaje_es_simulado=False,
        nivelacion_estado="Sí, confirmada",
        nivelacion_fuente="Oferta Oficial IES",
        nivelacion_es_demo=False,
        enlace_oficial=datos.enlace_oficial or "https://siau.senescyt.gob.ec",
        pagina_web=datos.enlace_oficial or "https://siau.senescyt.gob.ec",
        fuente_catalogo_ces="Catálogo oficial IES 2026",
        fuente_facultad=datos.fuente_facultad or "Portal oficial IES",
        fecha_consulta=ahora.strftime("%Y-%m"),
        lat=coords[0],
        lon=coords[1],
        estado_verificacion=datos.estado_verificacion or "Oferta de grado verificada 2026",
        descripcion=f"Carrera de {nom} impartida por {inst} en {fac}.",
        observaciones=datos.observaciones or "",
        modificado_por=gestor.email,
        fecha_modificacion=ahora,
    )

    db.add(nueva_carrera)
    db.commit()
    db.refresh(nueva_carrera)

    return nueva_carrera.to_dict()


@router.put(
    "/carreras/{carrera_id}",
    summary="Editar una carrera existente"
)
def editar_carrera(
    carrera_id: int,
    datos: CarreraActualizarRequest,
    gestor: Usuario = Depends(require_gestor_or_admin),
    db: Session = Depends(get_db),
):
    """
    Actualiza los datos académicos de una carrera: facultad, modalidades, sedes, duración, fuentes y enlaces.
    Registra quién realizó la modificación y fecha.
    """
    carrera = db.query(CarreraCatalogo).filter(CarreraCatalogo.id == carrera_id).first()
    if not carrera:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Carrera {carrera_id} no encontrada.")

    ahora = datetime.now(timezone.utc)

    if datos.nombre:
        carrera.nombre = datos.nombre.strip()
        carrera.nombre_normalizado = remover_tildes(datos.nombre.strip()).lower()
    if datos.institucion:
        carrera.institucion = datos.institucion.strip()
        carrera.institucion_normalizada = remover_tildes(datos.institucion.strip()).lower()
    if datos.siglas:
        carrera.siglas = datos.siglas.strip().upper()
    if datos.facultad:
        carrera.facultad = datos.facultad.strip()
    if datos.modalidad:
        carrera.modalidad = datos.modalidad.strip()
        carrera.modalidad_normalizada = remover_tildes(datos.modalidad.strip()).lower()
    if datos.canton:
        carrera.canton = datos.canton.strip()
        carrera.canton_normalizado = remover_tildes(datos.canton.strip()).lower()
        c_norm = carrera.canton_normalizado
        if c_norm in CANTON_COORDS:
            carrera.lat = CANTON_COORDS[c_norm][0]
            carrera.lon = CANTON_COORDS[c_norm][1]
    if datos.provincia:
        carrera.provincia = datos.provincia.strip()
        carrera.provincia_normalizada = remover_tildes(datos.provincia.strip()).lower()
    if datos.campus:
        carrera.campus = datos.campus.strip()
    if datos.duracion_semestres is not None:
        carrera.duracion_semestres = datos.duracion_semestres
        carrera.semestres_publicados = str(datos.duracion_semestres)
    if datos.titulo_otorga:
        carrera.titulo_otorga = datos.titulo_otorga.strip()
    if datos.enlace_oficial:
        carrera.enlace_oficial = datos.enlace_oficial.strip()
        carrera.pagina_web = datos.enlace_oficial.strip()
    if datos.fuente_facultad:
        carrera.fuente_facultad = datos.fuente_facultad.strip()
        carrera.respaldo_facultad = datos.fuente_facultad.strip()
    if datos.periodo_puntaje:
        carrera.periodo_puntaje = datos.periodo_puntaje.strip()
    if datos.estado_verificacion:
        carrera.estado_verificacion = datos.estado_verificacion.strip()
    if datos.observaciones is not None:
        carrera.observaciones = datos.observaciones.strip()

    # Reclasificar área vocacional si cambió nombre o facultad
    if datos.nombre or datos.facultad:
        areas = clasificar_10_areas_vocal(carrera.nombre, carrera.facultad)
        carrera.areas_vocacionales = areas
        carrera.area_vocacional = areas[0] if areas else carrera.area_vocacional

    carrera.modificado_por = gestor.email
    carrera.fecha_modificacion = ahora

    db.commit()
    db.refresh(carrera)

    return carrera.to_dict()


@router.patch(
    "/carreras/{carrera_id}/estado",
    summary="Activar o desactivar una carrera del catálogo visible"
)
def cambiar_estado_carrera(
    carrera_id: int,
    datos: CarreraCambiarEstadoRequest,
    gestor: Usuario = Depends(require_gestor_or_admin),
    db: Session = Depends(get_db),
):
    """
    Retira lógicamente la carrera del catálogo visible (es_vigente=False) o la reactiva (es_vigente=True).
    Conserva los registros relacionados con evaluaciones históricas, favoritos y comparaciones.
    """
    carrera = db.query(CarreraCatalogo).filter(CarreraCatalogo.id == carrera_id).first()
    if not carrera:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Carrera {carrera_id} no encontrada.")

    ahora = datetime.now(timezone.utc)
    carrera.es_vigente = datos.es_vigente

    if not datos.es_vigente:
        # Retirar a estado histórico para evitar colisión de unique constraint si se crea otra
        carrera.estado = f"HISTORICO_{carrera.id}"
    else:
        carrera.estado = "VIGENTE"

    carrera.modificado_por = gestor.email
    carrera.fecha_modificacion = ahora

    db.commit()
    db.refresh(carrera)

    return {
        "id": carrera.id,
        "nombre": carrera.nombre,
        "siglas": carrera.siglas,
        "es_vigente": carrera.es_vigente,
        "estado": carrera.estado,
        "mensaje": f"Carrera {'activada' if carrera.es_vigente else 'retirada del catálogo visible'} correctamente."
    }


@router.get(
    "/facultades",
    response_model=List[FacultadItemResponse],
    summary="Listar facultades por universidad"
)
def listar_facultades(
    siglas: Optional[str] = Query(None, description="Filtrar por sigla de institución"),
    gestor: Usuario = Depends(require_gestor_or_admin),
    db: Session = Depends(get_db),
):
    """
    Retorna el listado de facultades y unidades académicas por universidad con su conteo de carreras.
    """
    query = (
        db.query(
            CarreraCatalogo.siglas,
            CarreraCatalogo.institucion,
            CarreraCatalogo.facultad,
            func.count(func.distinct(CarreraCatalogo.nombre)).label("total_carreras"),
            func.max(CarreraCatalogo.respaldo_facultad).label("respaldo"),
        )
        .filter(
            CarreraCatalogo.facultad != None,
            CarreraCatalogo.facultad != "",
            CarreraCatalogo.es_vigente == True,
        )
    )

    if siglas and siglas.strip() and siglas != "Todas":
        query = query.filter(func.upper(CarreraCatalogo.siglas) == siglas.strip().upper())

    rows = query.group_by(
        CarreraCatalogo.siglas,
        CarreraCatalogo.institucion,
        CarreraCatalogo.facultad
    ).order_by(CarreraCatalogo.siglas, CarreraCatalogo.facultad).all()

    return [
        FacultadItemResponse(
            siglas=r.siglas,
            institucion=r.institucion,
            facultad=r.facultad,
            total_carreras=r.total_carreras,
            respaldo=r.respaldo,
        )
        for r in rows
    ]


@router.put(
    "/facultades/renombrar",
    summary="Renombrar una facultad y actualizar todas sus carreras asociadas"
)
def renombrar_facultad(
    datos: FacultadRenombrarRequest,
    gestor: Usuario = Depends(require_gestor_or_admin),
    db: Session = Depends(get_db),
):
    """
    Renombra una facultad o unidad académica para una universidad, conservando todas las relaciones con las carreras.
    """
    sig = datos.siglas.strip().upper()
    antigua = datos.facultad_antigua.strip()
    nueva = datos.facultad_nueva.strip()

    if not antigua or not nueva:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Los nombres de facultad no pueden estar vacíos.")

    ahora = datetime.now(timezone.utc)

    # Actualizar todas las carreras asociadas
    afectadas = (
        db.query(CarreraCatalogo)
        .filter(
            func.upper(CarreraCatalogo.siglas) == sig,
            CarreraCatalogo.facultad == antigua
        )
        .all()
    )

    if not afectadas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontraron carreras bajo la facultad '{antigua}' en la universidad {sig}."
        )

    for c in afectadas:
        c.facultad = nueva
        c.modificado_por = gestor.email
        c.fecha_modificacion = ahora

    db.commit()

    return {
        "siglas": sig,
        "facultad_antigua": antigua,
        "facultad_nueva": nueva,
        "carreras_actualizadas": len(afectadas),
        "mensaje": f"Se actualizó la facultad a '{nueva}' en {len(afectadas)} carreras de {sig}."
    }
