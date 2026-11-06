"""crear tablas usuarios y perfiles

Revision ID: 20261013_0001
Revises: 
Create Date: 2026-10-13 09:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20261013_0001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Tabla usuarios
    op.create_table(
        'usuarios',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('nombre_completo', sa.String(length=200), nullable=False),
        sa.Column('activo', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('creado_en', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('actualizado_en', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_usuarios_email'), 'usuarios', ['email'], unique=True)
    op.create_index(op.f('ix_usuarios_id'), 'usuarios', ['id'], unique=False)

    # 2. Tabla perfiles
    op.create_table(
        'perfiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), nullable=False),
        sa.Column('provincia', sa.String(length=100), nullable=False, server_default='Pichincha'),
        sa.Column('ciudad', sa.String(length=100), nullable=False, server_default='Quito'),
        sa.Column('modalidad_preferida', sa.String(length=50), nullable=False, server_default='Presencial'),
        sa.Column('medio_transporte', sa.String(length=50), nullable=False, server_default='Transporte público'),
        sa.Column('latitud_origen', sa.Float(), nullable=True),
        sa.Column('longitud_origen', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_perfiles_id'), 'perfiles', ['id'], unique=False)
    op.create_index(op.f('ix_perfiles_usuario_id'), 'perfiles', ['usuario_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_perfiles_usuario_id'), table_name='perfiles')
    op.drop_index(op.f('ix_perfiles_id'), table_name='perfiles')
    op.drop_table('perfiles')
    op.drop_index(op.f('ix_usuarios_id'), table_name='usuarios')
    op.drop_index(op.f('ix_usuarios_email'), table_name='usuarios')
    op.drop_table('usuarios')
