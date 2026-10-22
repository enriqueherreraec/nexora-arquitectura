from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError
import jwt
from src.core.config import settings

# Inicialización de hasher Argon2id con parámetros estándar de producción
ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16
)


def hash_password(password: str) -> str:
    """Genera hash seguro de la contraseña con Argon2id."""
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña en texto plano contra el hash Argon2id."""
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, InvalidHashError):
        return False
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Crea un token JWT con tiempo de expiración y firma HMAC-SHA256."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodifica y verifica la validez y firma de un token JWT."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
