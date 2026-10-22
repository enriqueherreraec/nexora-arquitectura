from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.core.security import decode_access_token
from src.models.usuario import Usuario

security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    """Valida el token Bearer JWT y recupera el usuario autenticado desde PostgreSQL."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar las credenciales de acceso.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar las credenciales de acceso.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload.get("sub")
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o sesión no válida.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Su cuenta se encuentra inactiva. Contacte al administrador del sistema.",
        )

    return usuario
