from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Evaluacion(Base):
    __tablename__ = "evaluaciones"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Versión del cuestionario (ej. '2.0-10areas')
    version_cuestionario = Column(String(50), default="2.0-10areas", nullable=False)

    # Respuestas dadas por el estudiante {pregunta_id: valor}
    respuestas_json = Column(JSON, nullable=False)
    
    # Desglose de afinidad por área {area: porcentaje}
    puntuaciones_areas = Column(JSON, nullable=False)
    
    # Área de mayor afinidad detectada
    area_predominante = Column(String(255), nullable=False)
    
    # Áreas empatadas en el primer lugar
    areas_empatadas = Column(JSON, nullable=True)
    es_empate = Column(Boolean, default=False, nullable=False)

    # Carreras recomendadas calculadas en esta evaluación
    carreras_sugeridas = Column(JSON, nullable=False)

    # Relación con el usuario
    usuario = relationship("Usuario", backref="evaluaciones")

    def __repr__(self) -> str:
        return f"<Evaluacion id={self.id} usuario_id={self.usuario_id} area='{self.area_predominante}'>"
