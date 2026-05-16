"""add project color

Revision ID: 20260516_0004
Revises: 20260516_0003
Create Date: 2026-05-16
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260516_0004"
down_revision: str | None = "20260516_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("projects", sa.Column("color", sa.String(length=7), nullable=False, server_default="#3b82f6"))


def downgrade() -> None:
    op.drop_column("projects", "color")
