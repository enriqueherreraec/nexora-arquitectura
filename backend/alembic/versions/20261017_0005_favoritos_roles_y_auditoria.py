"""Agregar roles de usuario, tabla de favoritos y auditoria de catalogo

Revision ID: 20261017_0005
Revises: 20261013_0004
Create Date: 2026-10-17 20:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20261017_0005'
down_revision = '20261013_0004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Agregar columna 'rol' en tabla usuarios (por defecto 'estudiante')
    op.add_column(
        'usuarios',
        sa.Column('rol', sa.String(length=50), server_default='estudiante', nullable=False)
    )

    # 2. Agregar columnas de auditoría en carreras_catalogo
    op.add_column(
        'carreras_catalogo',
        sa.Column('modificado_por', sa.String(length=255), nullable=True)
    )
    op.add_column(
        'carreras_catalogo',
        sa.Column('fecha_modificacion', sa.DateTime(timezone=True), nullable=True)
    )

    # 3. Crear tabla 'favoritos' con clave foránea en cascada y restricción única (usuario_id, carrera_id)
    op.create_table(
        'favoritos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), nullable=False),
        sa.Column('carrera_id', sa.Integer(), nullable=False),
        sa.Column('creado_en', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['carrera_id'], ['carreras_catalogo.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('usuario_id', 'carrera_id', name='uq_favoritos_usuario_carrera')
    )
    op.create_index(op.f('ix_favoritos_id'), 'favoritos', ['id'], unique=False)
    op.create_index(op.f('ix_favoritos_usuario_id'), 'favoritos', ['usuario_id'], unique=False)
    op.create_index(op.f('ix_favoritos_carrera_id'), 'favoritos', ['carrera_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_favoritos_carrera_id'), table_name='favoritos')
    op.drop_index(op.f('ix_favoritos_usuario_id'), table_name='favoritos')
    op.drop_index(op.f('ix_favoritos_id'), table_name='favoritos')
    op.drop_table('favoritos')
    op.drop_column('carreras_catalogo', 'fecha_modificacion')
    op.drop_column('carreras_catalogo', 'modificado_por')
    op.drop_column('usuarios', 'rol')
