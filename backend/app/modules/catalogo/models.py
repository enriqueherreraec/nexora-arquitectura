from sqlalchemy import Column, Integer, String, Float, Boolean, Text, JSON, UniqueConstraint, DateTime, Index
from app.core.database import Base


class CarreraCatalogo(Base):
    __tablename__ = "carreras_catalogo"

    id = Column(Integer, primary_key=True, index=True)
    institucion = Column(String(255), nullable=False)
    institucion_normalizada = Column(String(255), nullable=False, index=True)
    siglas = Column(String(50), nullable=True, index=True)
    tipo_ies = Column(String(100), nullable=True)
    tipo_financiamiento = Column(String(100), nullable=True, index=True)
    nombre = Column(String(255), nullable=False)
    nombre_normalizado = Column(String(255), nullable=False, index=True)
    campo_amplio = Column(String(255), nullable=True)
    area_vocacional = Column(String(100), nullable=False, index=True)
    nivel_formacion = Column(String(255), nullable=False)
    nivel_academico = Column(String(100), nullable=False, index=True)
    es_tercer_nivel = Column(Boolean, default=True, nullable=False, index=True)
    es_posgrado = Column(Boolean, default=False, nullable=False, index=True)
    modalidad = Column(String(100), nullable=False, index=True)
    modalidad_normalizada = Column(String(100), nullable=False)
    provincia = Column(String(100), nullable=False, index=True)
    provincia_normalizada = Column(String(100), nullable=False, index=True)
    canton = Column(String(100), nullable=True)
    canton_normalizado = Column(String(100), nullable=True, index=True)
    estado = Column(String(100), nullable=False, index=True)
    es_vigente = Column(Boolean, default=True, nullable=False, index=True)
    campus = Column(String(255), nullable=True)
    duracion_semestres = Column(Integer, default=9, nullable=False)
    puntaje_referencial = Column(Integer, default=750, nullable=False)
    puntaje_fuente = Column(String(200), default="Histórico Oficial SENESCYT", nullable=False)
    puntaje_es_simulado = Column(Boolean, default=False, nullable=False)
    nivelacion_estado = Column(String(100), default="Sí, confirmada", nullable=False)
    nivelacion_fuente = Column(String(200), default="Oferta Oficial IES", nullable=False)
    nivelacion_es_demo = Column(Boolean, default=False, nullable=False)
    enlace_oficial = Column(String(500), nullable=True)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    descripcion = Column(Text, nullable=True)

    # Nuevas columnas oficiales del CES 2026-10-13
    codigo_oferta = Column(String(50), nullable=True, index=True)
    codigo_ies = Column(String(20), nullable=True, index=True)
    titulo_otorga = Column(String(255), nullable=True)
    facultad = Column(String(255), nullable=True)
    respaldo_facultad = Column(String(255), nullable=True)
    campo_conocimiento_ces = Column(String(255), nullable=True)
    areas_vocacionales = Column(JSON, nullable=True)
    lugar_ejecucion = Column(String(255), nullable=True)
    semestres_publicados = Column(String(50), nullable=True)
    modalidad_duracion = Column(String(100), nullable=True)
    nivelacion_publicada = Column(String(100), nullable=True)
    referencia_puntaje = Column(String(100), nullable=True)
    tipo_referencia = Column(String(150), nullable=True)
    periodo_puntaje = Column(String(255), nullable=True)
    codigos_carrera_ces = Column(Text, nullable=True)
    resoluciones_ces = Column(Text, nullable=True)
    ultima_aprobacion_ces = Column(String(100), nullable=True)
    registros_ces_agrupados = Column(Integer, nullable=True)
    fuente_catalogo_ces = Column(String(255), nullable=True)
    fuente_facultad = Column(String(255), nullable=True)
    fuente_duracion = Column(String(255), nullable=True)
    fuente_puntaje = Column(String(255), nullable=True)
    pagina_web = Column(String(500), nullable=True)
    fecha_consulta = Column(String(50), nullable=True)
    observaciones = Column(Text, nullable=True)
    estado_verificacion = Column(String(100), nullable=True)
    modificado_por = Column(String(255), nullable=True)
    fecha_modificacion = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "institucion",
            "nombre",
            "modalidad",
            "canton",
            "nivel_formacion",
            "estado",
            name="uq_carreras_catalogo_oferta"
        ),
        Index("ix_carreras_catalogo_vigente_fac_nom", "es_vigente", "facultad", "nombre"),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "codigo_oferta": self.codigo_oferta or f"NXR-LEGACY-{self.id}",
            "codigo_ies": self.codigo_ies or "",
            "nombre": self.nombre,
            "titulo_otorga": self.titulo_otorga or self.nombre,
            "area_vocacional": self.area_vocacional,
            "areas_vocacionales": self.areas_vocacionales or [self.area_vocacional],
            "institucion": self.institucion,
            "siglas": self.siglas or "IES",
            "tipo_ies": self.tipo_ies or "Universidad Pública",
            "tipo_financiamiento": self.tipo_financiamiento or "PÚBLICA",
            "facultad": self.facultad or "Facultad no especificada",
            "respaldo_facultad": self.respaldo_facultad or "Fuente oficial",
            "campo_conocimiento_ces": self.campo_conocimiento_ces or self.campo_amplio or "",
            "campus": self.campus or f"Campus {self.canton or self.provincia}",
            "lugar_ejecucion": self.lugar_ejecucion or self.campus or "SEDE MATRIZ",
            "provincia": self.provincia,
            "ciudad": self.canton or self.provincia,
            "canton": self.canton,
            "modalidad": self.modalidad,
            "nivel_formacion": self.nivel_formacion,
            "nivel_academico": self.nivel_academico,
            "es_tercer_nivel": self.es_tercer_nivel,
            "es_posgrado": self.es_posgrado,
            "estado": self.estado,
            "es_vigente": self.es_vigente,
            "duracion_semestres": self.duracion_semestres,
            "semestres_publicados": self.semestres_publicados or str(self.duracion_semestres),
            "modalidad_duracion": self.modalidad_duracion or "Semestral",
            "puntaje_referencial": self.puntaje_referencial,
            "referencia_puntaje": self.referencia_puntaje or (f"{self.puntaje_referencial} pts" if self.puntaje_referencial else "Sin dato oficial verificado"),
            "tipo_referencia": self.tipo_referencia or self.puntaje_fuente,
            "periodo_puntaje": self.periodo_puntaje or "Histórico",
            "puntaje_fuente": self.fuente_puntaje or self.puntaje_fuente,
            "puntaje_es_simulado": self.puntaje_es_simulado,
            "nivelacion_estado": self.nivelacion_estado,
            "nivelacion_publicada": self.nivelacion_publicada or self.nivelacion_estado,
            "nivelacion_fuente": self.nivelacion_fuente,
            "nivelacion_es_demo": self.nivelacion_es_demo,
            "enlace_oficial": self.pagina_web or self.enlace_oficial or "https://siau.senescyt.gob.ec",
            "pagina_web": self.pagina_web or self.enlace_oficial or "https://siau.senescyt.gob.ec",
            "fuente_catalogo_ces": self.fuente_catalogo_ces or "Consulta CES",
            "observaciones": self.observaciones or "",
            "estado_verificacion": self.estado_verificacion or "Verificado oficial",
            "lat": self.lat or -0.2106,
            "lon": self.lon or -78.4891,
            "descripcion": self.descripcion or f"Carrera oficial en {self.nombre} impartida por {self.institucion} en modalidad {self.modalidad}.",
            "modificado_por": self.modificado_por,
            "fecha_modificacion": self.fecha_modificacion.isoformat() if self.fecha_modificacion else None,
        }
