from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nombre_completo = Column(String(200), nullable=False)
    activo = Column(Boolean, default=True, nullable=False)
    rol = Column(String(50), default="estudiante", nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    actualizado_en = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relación uno a uno con el perfil
    perfil = relationship("Perfil", back_populates="usuario", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Usuario id={self.id} email='{self.email}'>"
