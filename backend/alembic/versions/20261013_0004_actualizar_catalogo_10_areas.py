"""actualizar catalogo y evaluaciones con 10 areas vocacionales

Revision ID: 20261013_0004
Revises: 20261013_0003
Create Date: 2026-10-13 12:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20261013_0004'
down_revision: Union[str, None] = '20261013_0003'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Agregar nuevas columnas de la fuente CES oficial a carreras_catalogo
    op.add_column('carreras_catalogo', sa.Column('codigo_oferta', sa.String(length=50), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('codigo_ies', sa.String(length=20), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('titulo_otorga', sa.String(length=255), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('facultad', sa.String(length=255), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('respaldo_facultad', sa.String(length=255), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('campo_conocimiento_ces', sa.String(length=255), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('areas_vocacionales', sa.JSON(), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('lugar_ejecucion', sa.String(length=255), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('semestres_publicados', sa.String(length=50), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('modalidad_duracion', sa.String(length=100), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('nivelacion_publicada', sa.String(length=100), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('referencia_puntaje', sa.String(length=100), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('tipo_referencia', sa.String(length=150), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('periodo_puntaje', sa.String(length=50), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('codigos_carrera_ces', sa.Text(), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('resoluciones_ces', sa.Text(), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('ultima_aprobacion_ces', sa.String(length=100), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('registros_ces_agrupados', sa.Integer(), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('fuente_catalogo_ces', sa.String(length=255), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('fuente_facultad', sa.String(length=255), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('fuente_duracion', sa.String(length=255), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('fuente_puntaje', sa.String(length=255), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('pagina_web', sa.String(length=350), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('fecha_consulta', sa.String(length=50), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('observaciones', sa.Text(), nullable=True))
    op.add_column('carreras_catalogo', sa.Column('estado_verificacion', sa.String(length=100), nullable=True))

    op.create_index(op.f('ix_carreras_catalogo_codigo_oferta'), 'carreras_catalogo', ['codigo_oferta'], unique=False)
    op.create_index(op.f('ix_carreras_catalogo_codigo_ies'), 'carreras_catalogo', ['codigo_ies'], unique=False)

    # 2. Agregar columnas para versión de cuestionario y empates en evaluaciones
    op.add_column('evaluaciones', sa.Column('version_cuestionario', sa.String(length=50), server_default='2.0-10areas', nullable=False))
    op.add_column('evaluaciones', sa.Column('areas_empatadas', sa.JSON(), nullable=True))
    op.add_column('evaluaciones', sa.Column('es_empate', sa.Boolean(), server_default=sa.false(), nullable=False))


def downgrade() -> None:
    op.drop_column('evaluaciones', 'es_empate')
    op.drop_column('evaluaciones', 'areas_empatadas')
    op.drop_column('evaluaciones', 'version_cuestionario')

    op.drop_index(op.f('ix_carreras_catalogo_codigo_ies'), table_name='carreras_catalogo')
    op.drop_index(op.f('ix_carreras_catalogo_codigo_oferta'), table_name='carreras_catalogo')

    op.drop_column('carreras_catalogo', 'estado_verificacion')
    op.drop_column('carreras_catalogo', 'observaciones')
    op.drop_column('carreras_catalogo', 'fecha_consulta')
    op.drop_column('carreras_catalogo', 'pagina_web')
    op.drop_column('carreras_catalogo', 'fuente_puntaje')
    op.drop_column('carreras_catalogo', 'fuente_duracion')
    op.drop_column('carreras_catalogo', 'fuente_facultad')
    op.drop_column('carreras_catalogo', 'fuente_catalogo_ces')
    op.drop_column('carreras_catalogo', 'registros_ces_agrupados')
    op.drop_column('carreras_catalogo', 'ultima_aprobacion_ces')
    op.drop_column('carreras_catalogo', 'resoluciones_ces')
    op.drop_column('carreras_catalogo', 'codigos_carrera_ces')
    op.drop_column('carreras_catalogo', 'periodo_puntaje')
    op.drop_column('carreras_catalogo', 'tipo_referencia')
    op.drop_column('carreras_catalogo', 'referencia_puntaje')
    op.drop_column('carreras_catalogo', 'nivelacion_publicada')
    op.drop_column('carreras_catalogo', 'modalidad_duracion')
    op.drop_column('carreras_catalogo', 'semestres_publicados')
    op.drop_column('carreras_catalogo', 'lugar_ejecucion')
    op.add_column('carreras_catalogo', 'areas_vocacionales')
    op.drop_column('carreras_catalogo', 'campo_conocimiento_ces')
    op.drop_column('carreras_catalogo', 'respaldo_facultad')
    op.drop_column('carreras_catalogo', 'facultad')
    op.drop_column('carreras_catalogo', 'titulo_otorga')
    op.drop_column('carreras_catalogo', 'codigo_ies')
    op.drop_column('carreras_catalogo', 'codigo_oferta')
