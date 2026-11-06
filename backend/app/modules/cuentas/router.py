from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.modules.cuentas.models import Usuario
from app.modules.perfiles.models import Perfil
from app.modules.cuentas.schemas import (
    RegistroUsuarioRequest,
    LoginRequest,
    TokenResponse,
    UsuarioResponse,
)
from app.modules.cuentas.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Autenticación y Cuentas"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registro de nuevo estudiante"
)
def registrar_usuario(
    datos: RegistroUsuarioRequest,
    db: Session = Depends(get_db)
):
    """
    Crea una nueva cuenta de usuario con contraseña protegida mediante Argon2id,
    genera su perfil inicial de preferencias y emite un token JWT de acceso.
    """
    # Verificar si el correo ya existe
    email_limpio = datos.email.lower().strip()
    usuario_existente = db.query(Usuario).filter(Usuario.email == email_limpio).first()
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ingresado ya se encuentra registrado."
        )

    # Hash seguro con Argon2
    password_hasheada = hash_password(datos.password)

    # Crear entidad usuario (estudiante siempre por defecto en registro público)
    nuevo_usuario = Usuario(
        email=email_limpio,
        password_hash=password_hasheada,
        nombre_completo=datos.nombre_completo.strip(),
        activo=True,
        rol="estudiante",
    )
    db.add(nuevo_usuario)
    db.flush()  # Para obtener el id generado

    # Crear perfil asociado
    nuevo_perfil = Perfil(
        usuario_id=nuevo_usuario.id,
        provincia=datos.provincia or "Pichincha",
        ciudad=datos.ciudad or "Quito",
        modalidad_preferida=datos.modalidad_preferida or "Presencial",
        medio_transporte=datos.medio_transporte or "Transporte público",
    )
    db.add(nuevo_perfil)
    db.commit()
    db.refresh(nuevo_usuario)

    # Generar token JWT
    expires_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    token = create_access_token(
        data={"sub": nuevo_usuario.email, "uid": nuevo_usuario.id, "rol": nuevo_usuario.rol},
        expires_delta=timedelta(minutes=expires_minutes)
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_seconds=expires_minutes * 60,
        usuario=nuevo_usuario
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Inicio de sesión con correo y contraseña"
)
def iniciar_sesion(
    datos: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Valida credenciales contra el hash Argon2id y retorna el token JWT de sesión.
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

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_seconds=expires_minutes * 60,
        usuario=usuario
    )


@router.get(
    "/me",
    response_model=UsuarioResponse,
    summary="Obtener información del usuario en sesión"
)
def obtener_usuario_actual(
    usuario_actual: Usuario = Depends(get_current_user)
):
    """
    Ruta protegida: retorna la información del perfil del estudiante autenticado.
    """
    return usuario_actual
