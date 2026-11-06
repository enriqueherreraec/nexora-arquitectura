from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.modules.cuentas.dependencies import get_current_user
from app.modules.cuentas.models import Usuario
from app.modules.perfiles.models import Perfil
from app.modules.cuentas.schemas import PerfilBase, PerfilResponse

router = APIRouter(prefix="/perfiles", tags=["Perfiles de Estudiantes"])


@router.get(
    "/mi-perfil",
    response_model=PerfilResponse,
    summary="Consultar perfil del estudiante autenticado"
)
def obtener_mi_perfil(
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    perfil = db.query(Perfil).filter(Perfil.usuario_id == usuario_actual.id).first()
    if not perfil:
        # Si aún no existe, crear uno por defecto
        perfil = Perfil(usuario_id=usuario_actual.id)
        db.add(perfil)
        db.commit()
        db.refresh(perfil)
    return perfil


@router.put(
    "/mi-perfil",
    response_model=PerfilResponse,
    summary="Actualizar preferencias demográficas y de movilidad"
)
def actualizar_mi_perfil(
    datos: PerfilBase,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    perfil = db.query(Perfil).filter(Perfil.usuario_id == usuario_actual.id).first()
    if not perfil:
        perfil = Perfil(usuario_id=usuario_actual.id)
        db.add(perfil)

    perfil.provincia = datos.provincia
    perfil.ciudad = datos.ciudad
    perfil.modalidad_preferida = datos.modalidad_preferida
    perfil.medio_transporte = datos.medio_transporte
    perfil.latitud_origen = datos.latitud_origen
    perfil.longitud_origen = datos.longitud_origen

    db.commit()
    db.refresh(perfil)
    return perfil
