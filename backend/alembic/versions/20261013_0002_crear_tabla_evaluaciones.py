"""crear tabla evaluaciones

Revision ID: 20261013_0002
Revises: 20261013_0001
Create Date: 2026-10-13 10:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20261013_0002'
down_revision: Union[str, None] = '20261013_0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'evaluaciones',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), nullable=False),
        sa.Column('creado_en', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('respuestas_json', sa.JSON(), nullable=False),
        sa.Column('puntuaciones_areas', sa.JSON(), nullable=False),
        sa.Column('area_predominante', sa.String(length=100), nullable=False),
        sa.Column('carreras_sugeridas', sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_evaluaciones_id'), 'evaluaciones', ['id'], unique=False)
    op.create_index(op.f('ix_evaluaciones_usuario_id'), 'evaluaciones', ['usuario_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_evaluaciones_usuario_id'), table_name='evaluaciones')
    op.drop_index(op.f('ix_evaluaciones_id'), table_name='evaluaciones')
    op.drop_table('evaluaciones')
