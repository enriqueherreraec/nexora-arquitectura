from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from src.core.database import Base


class Evaluacion(Base):
    __tablename__ = "evaluaciones"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    version_cuestionario = Column(String(50), default="3.0-20preguntas", nullable=False)
    respuestas_json = Column(JSON, nullable=False)
    puntuaciones_areas = Column(JSON, nullable=False)
    area_predominante = Column(String(100), nullable=False)
    areas_empatadas = Column(JSON, default=list, nullable=False)
    es_empate = Column(Boolean, default=False, nullable=False)
    carreras_sugeridas = Column(JSON, default=list, nullable=False)
    creado_en = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    usuario = relationship("Usuario", back_populates="evaluaciones")
