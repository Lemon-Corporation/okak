"""add project ai contexts

Revision ID: 20260521_0005
Revises: 20260516_0004
Create Date: 2026-05-21
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260521_0005"
down_revision: str | None = "20260516_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "project_ai_contexts",
        sa.Column("owner_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="stale", nullable=False),
        sa.Column("summary", sa.Text(), server_default="", nullable=False),
        sa.Column("source_counts", postgresql.JSONB(astext_type=sa.Text()), server_default=sa.text("'{}'::jsonb"), nullable=False),
        sa.Column("tokens_estimate", sa.Integer(), server_default="0", nullable=False),
        sa.Column("last_rebuilt_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("marked_stale_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["owner_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("project_id"),
    )
    op.create_index("ix_project_ai_contexts_owner_user_id", "project_ai_contexts", ["owner_user_id"])
    op.create_index("ix_project_ai_contexts_project_id", "project_ai_contexts", ["project_id"], unique=True)
    op.create_index("ix_project_ai_contexts_status", "project_ai_contexts", ["status"])


def downgrade() -> None:
    op.drop_index("ix_project_ai_contexts_status", table_name="project_ai_contexts")
    op.drop_index("ix_project_ai_contexts_project_id", table_name="project_ai_contexts")
    op.drop_index("ix_project_ai_contexts_owner_user_id", table_name="project_ai_contexts")
    op.drop_table("project_ai_contexts")
