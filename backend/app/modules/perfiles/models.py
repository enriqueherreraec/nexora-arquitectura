from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Perfil(Base):
    __tablename__ = "perfiles"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    provincia = Column(String(100), default="Pichincha", nullable=False)
    ciudad = Column(String(100), default="Quito", nullable=False)
    modalidad_preferida = Column(String(50), default="Presencial", nullable=False)
    medio_transporte = Column(String(50), default="Transporte público", nullable=False)
    latitud_origen = Column(Float, nullable=True)
    longitud_origen = Column(Float, nullable=True)

    usuario = relationship("Usuario", back_populates="perfil")

    def __repr__(self) -> str:
        return f"<Perfil usuario_id={self.usuario_id} ciudad='{self.ciudad}'>"
