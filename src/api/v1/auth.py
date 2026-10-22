from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.core.config import settings
from src.core.database import get_db
from src.core.security import verify_password, create_access_token
from src.models.usuario import Usuario
from src.schemas.auth import LoginRequest, TokenResponse, UsuarioResponse, PerfilResponse

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Iniciar sesión con correo y contraseña",
    responses={
        401: {"description": "Credenciales incorrectas"},
        403: {"description": "Cuenta inactiva"},
        422: {"description": "Error de validación sintáctica"},
    }
)
def iniciar_sesion(
    datos: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Valida credenciales contra la base de datos PostgreSQL y emite el token JWT de sesión.
    Cumple con el escenario E6: rechaza intentos inválidos con HTTP 401 y 0 tokens emitidos.
    """
    email_limpio = datos.email.lower().strip()
    usuario = db.query(Usuario).filter(Usuario.email == email_limpio).first()

    if not usuario or not verify_password(datos.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas. Verifique su correo y contraseña.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Su cuenta se encuentra inactiva. Contacte al administrador del sistema."
        )

    expires_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    token = create_access_token(
        data={"sub": usuario.email, "uid": usuario.id, "rol": usuario.rol},
        expires_delta=timedelta(minutes=expires_minutes)
    )

    perfil_data = None
    if usuario.perfil:
        perfil_data = PerfilResponse(
            id=usuario.perfil.id,
            usuario_id=usuario.perfil.usuario_id,
            provincia=usuario.perfil.provincia,
            ciudad=usuario.perfil.ciudad,
            modalidad_preferida=usuario.perfil.modalidad_preferida,
            medio_transporte=usuario.perfil.medio_transporte,
        )

    usuario_resp = UsuarioResponse(
        id=usuario.id,
        email=usuario.email,
        nombre_completo=usuario.nombre_completo,
        rol=usuario.rol,
        activo=usuario.activo,
        creado_en=usuario.creado_en,
        perfil=perfil_data,
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_seconds=expires_minutes * 60,
        usuario=usuario_resp,
    )
