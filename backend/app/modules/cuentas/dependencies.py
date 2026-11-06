from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.modules.cuentas.models import Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Valida el token Bearer JWT y recupera el usuario autenticado desde la base de datos.
    Retorna error 401 si el token es inválido o ha expirado.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sesión expirada o token no válido. Por favor inicie sesión de nuevo.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if usuario is None:
        raise credentials_exception

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta de usuario se encuentra inactiva."
        )

    return usuario


def require_role(roles_permitidos: list[str]):
    """
    Fábrica de dependencias que comprueba si el usuario autenticado posee uno de los roles permitidos.
    Retorna 403 Forbidden si el rol no coincide.
    """
    def verificar_rol(usuario_actual: Usuario = Depends(get_current_user)) -> Usuario:
        rol_usuario = (usuario_actual.rol or "estudiante").lower().strip()
        roles_normalizados = [r.lower().strip() for r in roles_permitidos]
        if rol_usuario not in roles_normalizados:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere uno de los siguientes roles: {', '.join(roles_permitidos)}."
            )
        return usuario_actual

    return verificar_rol


require_gestor_or_admin = require_role(["gestor", "admin"])
require_admin = require_role(["admin"])
require_estudiante = require_role(["estudiante"])

