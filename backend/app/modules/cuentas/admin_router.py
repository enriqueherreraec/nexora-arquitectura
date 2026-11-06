from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password
from app.modules.cuentas.models import Usuario
from app.modules.perfiles.models import Perfil
from app.modules.cuentas.dependencies import require_admin
from app.modules.cuentas.schemas import (
    UsuarioResponse,
    AdminCrearUsuarioRequest,
    AdminActualizarRolRequest,
    AdminActualizarEstadoRequest,
)

router = APIRouter(prefix="/admin/usuarios", tags=["Administración de Usuarios y Roles"])


@router.get("", include_in_schema=False)
@router.get(
    "/",
    response_model=List[UsuarioResponse],
    summary="Listar usuarios del sistema (solo Administrador)"
)
def listar_usuarios(
    search: Optional[str] = Query(None, description="Buscar por nombre o correo"),
    rol: Optional[str] = Query(None, description="Filtrar por rol: estudiante, gestor, admin"),
    admin: Usuario = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Retorna la lista de usuarios registrados. Operación restringida a Administradores.
    """
    query = db.query(Usuario)

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter((Usuario.email.ilike(term)) | (Usuario.nombre_completo.ilike(term)))

    if rol and rol.strip() and rol != "Todos":
        query = query.filter(Usuario.rol == rol.strip().lower())

    usuarios = query.order_by(Usuario.id.asc()).all()
    return usuarios


@router.post(
    "/",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear una cuenta con rol específico (Gestor o Administrador)"
)
def crear_usuario_administrativo(
    datos: AdminCrearUsuarioRequest,
    admin: Usuario = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Crea una cuenta con el rol indicado (ej. Gestor Académico o Administrador).
    """
    email_limpio = datos.email.lower().strip()
    existente = db.query(Usuario).filter(Usuario.email == email_limpio).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El correo {email_limpio} ya se encuentra registrado."
        )

    nuevo_usuario = Usuario(
        email=email_limpio,
        password_hash=hash_password(datos.password),
        nombre_completo=datos.nombre_completo.strip(),
        activo=True,
        rol=datos.rol,
    )
    db.add(nuevo_usuario)
    db.flush()

    # Perfil básico
    perfil = Perfil(
        usuario_id=nuevo_usuario.id,
        provincia="Pichincha",
        ciudad="Quito",
        modalidad_preferida="Presencial",
        medio_transporte="No especificado",
    )
    db.add(perfil)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario


@router.patch(
    "/{usuario_id}/rol",
    response_model=UsuarioResponse,
    summary="Asignar un rol a una cuenta existente (solo Administrador)"
)
def actualizar_rol_usuario(
    usuario_id: int,
    datos: AdminActualizarRolRequest,
    admin: Usuario = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Actualiza el rol de una cuenta (estudiante, gestor, admin).
    No permite que el propio administrador se despoje de su rol si es el único admin activo.
    """
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con id {usuario_id} no encontrado."
        )

    if usuario.id == admin.id and datos.rol != "admin":
        total_admins = db.query(Usuario).filter(Usuario.rol == "admin", Usuario.activo == True).count()
        if total_admins <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puede revocar el rol de administrador a su propia cuenta si es el único administrador activo."
            )

    usuario.rol = datos.rol
    db.commit()
    db.refresh(usuario)
    return usuario


@router.patch(
    "/{usuario_id}/estado",
    response_model=UsuarioResponse,
    summary="Activar o desactivar cuenta de usuario (solo Administrador)"
)
def actualizar_estado_usuario(
    usuario_id: int,
    datos: AdminActualizarEstadoRequest,
    admin: Usuario = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Modifica el estado activo/inactivo de un usuario.
    """
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Usuario con id {usuario_id} no encontrado."
        )

    if usuario.id == admin.id and not datos.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puede desactivar su propia cuenta de administrador."
        )

    usuario.activo = datos.activo
    db.commit()
    db.refresh(usuario)
    return usuario
