from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.cuentas.models import Usuario
from app.modules.cuentas.dependencies import require_estudiante
from app.modules.catalogo.models import CarreraCatalogo
from app.modules.favoritos.models import Favorito
from app.modules.favoritos.schemas import (
    FavoritoResponse,
    FavoritoIdsResponse,
    FavoritoToggleResponse,
)

router = APIRouter(prefix="/favoritos", tags=["Carreras Favoritas"])


@router.get(
    "/",
    response_model=List[FavoritoResponse],
    summary="Listar carreras favoritas del estudiante en sesión"
)
def listar_favoritos(
    usuario_actual: Usuario = Depends(require_estudiante),
    db: Session = Depends(get_db),
):
    """
    Retorna la lista de carreras activas guardadas como favoritas por el usuario autenticado.
    Cada estudiante accede únicamente a sus propios favoritos vigentes.
    """
    favoritos = (
        db.query(Favorito)
        .join(CarreraCatalogo, Favorito.carrera_id == CarreraCatalogo.id)
        .filter(
            Favorito.usuario_id == usuario_actual.id,
            CarreraCatalogo.es_vigente == True
        )
        .order_by(Favorito.creado_en.desc())
        .all()
    )

    resultado = []
    for fav in favoritos:
        carrera_dict = fav.carrera.to_dict() if fav.carrera else None
        resultado.append(
            FavoritoResponse(
                id=fav.id,
                usuario_id=fav.usuario_id,
                carrera_id=fav.carrera_id,
                creado_en=fav.creado_en,
                carrera=carrera_dict,
            )
        )

    return resultado


@router.get(
    "/ids",
    response_model=FavoritoIdsResponse,
    summary="Obtener identificadores de carreras favoritas"
)
def obtener_ids_favoritos(
    usuario_actual: Usuario = Depends(require_estudiante),
    db: Session = Depends(get_db),
):
    """
    Retorna únicamente los IDs de las carreras favoritas activas del estudiante para rápida consulta en la interfaz.
    """
    favs = (
        db.query(Favorito.carrera_id)
        .join(CarreraCatalogo, Favorito.carrera_id == CarreraCatalogo.id)
        .filter(
            Favorito.usuario_id == usuario_actual.id,
            CarreraCatalogo.es_vigente == True
        )
        .all()
    )
    ids = [f[0] for f in favs]
    return FavoritoIdsResponse(favoritos_ids=ids, total=len(ids))


@router.post(
    "/{carrera_id}",
    response_model=FavoritoToggleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Añadir una carrera a favoritos"
)
def agregar_favorito(
    carrera_id: int,
    response: Response,
    usuario_actual: Usuario = Depends(require_estudiante),
    db: Session = Depends(get_db),
):
    """
    Guarda una carrera activa en los favoritos del estudiante. Evita duplicados si ya estaba guardada.
    """
    # Verificar que la carrera exista y esté activa en el catálogo
    carrera = db.query(CarreraCatalogo).filter(
        CarreraCatalogo.id == carrera_id,
        CarreraCatalogo.es_vigente == True
    ).first()
    if not carrera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"La carrera no existe o se encuentra inactiva en el catálogo."
        )

    # Verificar si ya existe en favoritos
    fav_existente = (
        db.query(Favorito)
        .filter(Favorito.usuario_id == usuario_actual.id, Favorito.carrera_id == carrera_id)
        .first()
    )
    if fav_existente:
        response.status_code = status.HTTP_200_OK
        return FavoritoToggleResponse(
            carrera_id=carrera_id,
            favorito=True,
            mensaje="La carrera ya se encuentra en sus favoritas."
        )

    nuevo_fav = Favorito(
        usuario_id=usuario_actual.id,
        carrera_id=carrera_id,
    )
    db.add(nuevo_fav)
    db.commit()

    return FavoritoToggleResponse(
        carrera_id=carrera_id,
        favorito=True,
        mensaje="Carrera añadida a sus favoritas con éxito."
    )


@router.delete(
    "/{carrera_id}",
    response_model=FavoritoToggleResponse,
    summary="Quitar una carrera de favoritos"
)
def quitar_favorito(
    carrera_id: int,
    usuario_actual: Usuario = Depends(require_estudiante),
    db: Session = Depends(get_db),
):
    """
    Elimina una carrera de los favoritos del estudiante autenticado.
    """
    fav = (
        db.query(Favorito)
        .filter(Favorito.usuario_id == usuario_actual.id, Favorito.carrera_id == carrera_id)
        .first()
    )
    if not fav:
        return FavoritoToggleResponse(
            carrera_id=carrera_id,
            favorito=False,
            mensaje="La carrera no estaba en sus favoritas."
        )

    db.delete(fav)
    db.commit()

    return FavoritoToggleResponse(
        carrera_id=carrera_id,
        favorito=False,
        mensaje="Carrera eliminada de sus favoritas con éxito."
    )
