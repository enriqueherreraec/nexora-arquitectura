from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Favorito(Base):
    __tablename__ = "favoritos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    carrera_id = Column(Integer, ForeignKey("carreras_catalogo.id", ondelete="CASCADE"), nullable=False, index=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("usuario_id", "carrera_id", name="uq_favoritos_usuario_carrera"),
    )

    # Relaciones
    usuario = relationship("Usuario", backref="favoritos")
    carrera = relationship("CarreraCatalogo", backref="favoritos")

    def __repr__(self) -> str:
        return f"<Favorito id={self.id} usuario_id={self.usuario_id} carrera_id={self.carrera_id}>"
