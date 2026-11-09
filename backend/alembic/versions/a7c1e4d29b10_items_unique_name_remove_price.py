"""items: nome unico e remove price

Revision ID: a7c1e4d29b10
Revises: 18f67a32c314

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a7c1e4d29b10"
down_revision: Union[str, Sequence[str], None] = "18f67a32c314"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Remove nomes repetidos antes de criar a restricao, mantendo o item mais antigo.
    op.execute("""
        DELETE FROM items a
        USING items b
        WHERE a.name = b.name AND a.id > b.id
        """)
    op.alter_column(
        "items",
        "name",
        existing_type=sa.String(length=120),
        type_=sa.String(length=100),
        existing_nullable=False,
    )
    op.create_unique_constraint("uq_items_name", "items", ["name"])
    op.drop_column("items", "price")


def downgrade() -> None:
    op.add_column(
        "items",
        sa.Column(
            "price",
            sa.Numeric(precision=10, scale=2),
            nullable=False,
            server_default="0",
        ),
    )
    op.alter_column("items", "price", server_default=None)
    op.drop_constraint("uq_items_name", "items", type_="unique")
    op.alter_column(
        "items",
        "name",
        existing_type=sa.String(length=100),
        type_=sa.String(length=120),
        existing_nullable=False,
    )
