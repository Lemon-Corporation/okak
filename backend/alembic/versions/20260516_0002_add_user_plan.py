"""add user plan

Revision ID: 20260516_0002
Revises: 20260509_0001
Create Date: 2026-05-16
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20260516_0002"
down_revision: str | None = "20260509_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("users", sa.Column("plan", sa.String(length=20), nullable=False, server_default="free"))


def downgrade() -> None:
    op.drop_column("users", "plan")
