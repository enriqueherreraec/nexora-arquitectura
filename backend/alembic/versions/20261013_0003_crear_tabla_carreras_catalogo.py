"""crear tabla carreras_catalogo

Revision ID: 20261013_0003
Revises: 20261013_0002
Create Date: 2026-10-13 11:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20261013_0003'
down_revision: Union[str, None] = '20261013_0002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'carreras_catalogo',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('institucion', sa.String(length=255), nullable=False),
        sa.Column('institucion_normalizada', sa.String(length=255), nullable=False),
        sa.Column('siglas', sa.String(length=50), nullable=True),
        sa.Column('tipo_ies', sa.String(length=100), nullable=True),
        sa.Column('tipo_financiamiento', sa.String(length=100), nullable=True),
        sa.Column('nombre', sa.String(length=255), nullable=False),
        sa.Column('nombre_normalizado', sa.String(length=255), nullable=False),
        sa.Column('campo_amplio', sa.String(length=255), nullable=True),
        sa.Column('area_vocacional', sa.String(length=100), nullable=False),
        sa.Column('nivel_formacion', sa.String(length=255), nullable=False),
        sa.Column('nivel_academico', sa.String(length=100), nullable=False),
        sa.Column('es_tercer_nivel', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('es_posgrado', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('modalidad', sa.String(length=100), nullable=False),
        sa.Column('modalidad_normalizada', sa.String(length=100), nullable=False),
        sa.Column('provincia', sa.String(length=100), nullable=False),
        sa.Column('provincia_normalizada', sa.String(length=100), nullable=False),
        sa.Column('canton', sa.String(length=100), nullable=True),
        sa.Column('canton_normalizado', sa.String(length=100), nullable=True),
        sa.Column('estado', sa.String(length=100), nullable=False),
        sa.Column('es_vigente', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('campus', sa.String(length=255), nullable=True),
        sa.Column('duracion_semestres', sa.Integer(), nullable=False, server_default='9'),
        sa.Column('puntaje_referencial', sa.Integer(), nullable=False, server_default='750'),
        sa.Column('puntaje_fuente', sa.String(length=200), nullable=False, server_default='Histórico Oficial SENESCYT'),
        sa.Column('puntaje_es_simulado', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('nivelacion_estado', sa.String(length=100), nullable=False, server_default='Sí, confirmada'),
        sa.Column('nivelacion_fuente', sa.String(length=200), nullable=False, server_default='Oferta Oficial IES'),
        sa.Column('nivelacion_es_demo', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('enlace_oficial', sa.String(length=300), nullable=True),
        sa.Column('lat', sa.Float(), nullable=True),
        sa.Column('lon', sa.Float(), nullable=True),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint(
            'institucion',
            'nombre',
            'modalidad',
            'canton',
            'nivel_formacion',
            'estado',
            name='uq_carreras_catalogo_oferta'
        )
    )
    op.create_index(op.f('ix_carreras_catalogo_id'), 'carreras_catalogo', ['id'], unique=False)
    op.create_index(op.f('ix_carreras_catalogo_institucion_normalizada'), 'carreras_catalogo', ['institucion_normalizada'], unique=False)
    op.create_index(op.f('ix_carreras_catalogo_siglas'), 'carreras_catalogo', ['siglas'], unique=False)
    op.create_index(op.f('ix_carreras_catalogo_tipo_financiamiento'), 'carreras_catalogo', ['tipo_financiamiento'], unique=False)
    op.create_index(op.f('ix_carreras_catalogo_nombre_normalizado'), 'carreras_catalogo', ['nombre_normalizado'], unique=False)
    op.create_index(op.f('ix_carreras_catalogo_area_vocacional'), 'carreras_catalogo', ['area_vocacional'], unique=False)
    op.create_index(op.f('ix_carreras_catalogo_nivel_academico'), 'carreras_catalogo', ['nivel_academico'], unique=False)
    op.create_index(op.f('ix_carreras_catalogo_es_tercer_nivel'), 'carreras_catalogo', ['es_tercer_nivel'], unique=False)
    op.create_index(op.f('ix_carreras_catalogo_es_posgrado'), 'carreras_catalogo', ['es_posgrado'], unique=False)
    op.create_index(op.f('ix_carreras_catalogo_modalidad'), 'carreras_catalogo', ['modalidad'], unique=False)
    op.create_index(op.f('ix_carreras_catalogo_provincia'), 'carreras_catalogo', ['provincia'], unique=False)
    op.create_index(op.f('ix_carreras_catalogo_provincia_normalizada'), 'carreras_catalogo', ['provincia_normalizada'], unique=False)
    op.create_index(op.f('ix_carreras_catalogo_canton_normalizado'), 'carreras_catalogo', ['canton_normalizado'], unique=False)
    op.create_index(op.f('ix_carreras_catalogo_estado'), 'carreras_catalogo', ['estado'], unique=False)
    op.create_index(op.f('ix_carreras_catalogo_es_vigente'), 'carreras_catalogo', ['es_vigente'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_carreras_catalogo_es_vigente'), table_name='carreras_catalogo')
    op.drop_index(op.f('ix_carreras_catalogo_estado'), table_name='carreras_catalogo')
    op.drop_index(op.f('ix_carreras_catalogo_canton_normalizado'), table_name='carreras_catalogo')
    op.drop_index(op.f('ix_carreras_catalogo_provincia_normalizada'), table_name='carreras_catalogo')
    op.drop_index(op.f('ix_carreras_catalogo_provincia'), table_name='carreras_catalogo')
    op.drop_index(op.f('ix_carreras_catalogo_modalidad'), table_name='carreras_catalogo')
    op.drop_index(op.f('ix_carreras_catalogo_es_posgrado'), table_name='carreras_catalogo')
    op.drop_index(op.f('ix_carreras_catalogo_es_tercer_nivel'), table_name='carreras_catalogo')
    op.drop_index(op.f('ix_carreras_catalogo_nivel_academico'), table_name='carreras_catalogo')
    op.drop_index(op.f('ix_carreras_catalogo_area_vocacional'), table_name='carreras_catalogo')
    op.drop_index(op.f('ix_carreras_catalogo_nombre_normalizado'), table_name='carreras_catalogo')
    op.drop_index(op.f('ix_carreras_catalogo_tipo_financiamiento'), table_name='carreras_catalogo')
    op.drop_index(op.f('ix_carreras_catalogo_siglas'), table_name='carreras_catalogo')
    op.drop_index(op.f('ix_carreras_catalogo_institucion_normalizada'), table_name='carreras_catalogo')
    op.drop_index(op.f('ix_carreras_catalogo_id'), table_name='carreras_catalogo')
    op.drop_table('carreras_catalogo')
