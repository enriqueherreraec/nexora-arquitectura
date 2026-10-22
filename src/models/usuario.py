from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from src.core.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nombre_completo = Column(String(150), nullable=False)
    rol = Column(String(30), default="estudiante", nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
    creado_en = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    perfil = relationship("Perfil", back_populates="usuario", uselist=False, cascade="all, delete-orphan")
    evaluaciones = relationship("Evaluacion", back_populates="usuario", cascade="all, delete-orphan")


class Perfil(Base):
    __tablename__ = "perfiles"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), unique=True, nullable=False)
    provincia = Column(String(100), default="Pichincha", nullable=False)
    ciudad = Column(String(100), default="Quito", nullable=False)
    modalidad_preferida = Column(String(50), default="Presencial", nullable=False)
    medio_transporte = Column(String(50), default="Transporte público", nullable=False)

    usuario = relationship("Usuario", back_populates="perfil")
