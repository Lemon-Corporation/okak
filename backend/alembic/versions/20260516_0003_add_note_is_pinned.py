"""add note is_pinned

Revision ID: 20260516_0003
Revises: 20260516_0002
Create Date: 2026-05-16
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260516_0003"
down_revision: str | None = "20260516_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("notes", sa.Column("is_pinned", sa.Boolean(), nullable=False, server_default="false"))


def downgrade() -> None:
    op.drop_column("notes", "is_pinned")
