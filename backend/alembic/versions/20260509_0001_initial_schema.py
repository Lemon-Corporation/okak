"""initial schema

Revision ID: 20260509_0001
Revises:
Create Date: 2026-05-09
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20260509_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()

    project_kind = postgresql.ENUM(
        "workspace",
        "project",
        "folder",
        name="project_kind",
        create_type=False,
    )
    project_status = postgresql.ENUM(
        "active",
        "on_hold",
        "completed",
        "archived",
        name="project_status",
        create_type=False,
    )
    note_status = postgresql.ENUM(
        "draft",
        "published",
        "archived",
        name="note_status",
        create_type=False,
    )
    task_status = postgresql.ENUM(
        "backlog",
        "todo",
        "in_progress",
        "done",
        "cancelled",
        name="task_status",
        create_type=False,
    )
    task_priority = postgresql.ENUM(
        "none",
        "low",
        "medium",
        "high",
        "urgent",
        name="task_priority",
        create_type=False,
    )
    file_source = postgresql.ENUM(
        "upload",
        "generated",
        name="file_source",
        create_type=False,
    )

    for enum_type in (
        project_kind,
        project_status,
        note_status,
        task_status,
        task_priority,
        file_source,
    ):
        enum_type.create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("display_name", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_table(
        "projects",
        sa.Column("owner_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("parent_project_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("kind", project_kind, server_default="project", nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), server_default="", nullable=False),
        sa.Column("status", project_status, server_default="active", nullable=False),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["owner_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["parent_project_id"], ["projects.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_projects_owner_user_id", "projects", ["owner_user_id"])
    op.create_index("ix_projects_parent_project_id", "projects", ["parent_project_id"])
    op.create_index("ix_projects_status", "projects", ["status"])

    op.create_table(
        "notes",
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), server_default="", nullable=False),
        sa.Column("status", note_status, server_default="draft", nullable=False),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notes_project_id", "notes", ["project_id"])
    op.create_index("ix_notes_status", "notes", ["status"])

    op.create_table(
        "tasks",
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("linked_note_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), server_default="", nullable=False),
        sa.Column("status", task_status, server_default="backlog", nullable=False),
        sa.Column("priority", task_priority, server_default="none", nullable=False),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["linked_note_id"], ["notes.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tasks_project_id", "tasks", ["project_id"])
    op.create_index("ix_tasks_status", "tasks", ["status"])
    op.create_index("ix_tasks_priority", "tasks", ["priority"])
    op.create_index("ix_tasks_due_at", "tasks", ["due_at"])

    op.create_table(
        "files",
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("original_name", sa.String(length=500), nullable=False),
        sa.Column("storage_key", sa.String(length=1000), nullable=False),
        sa.Column("mime_type", sa.String(length=255), nullable=True),
        sa.Column("extension", sa.String(length=50), nullable=True),
        sa.Column("size_bytes", sa.BigInteger(), nullable=False),
        sa.Column("checksum_sha256", sa.String(length=64), nullable=True),
        sa.Column("source", file_source, server_default="upload", nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("storage_key"),
    )
    op.create_index("ix_files_project_id", "files", ["project_id"])
    op.create_index("ix_files_checksum_sha256", "files", ["checksum_sha256"])

    op.create_table(
        "tags",
        sa.Column("owner_user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("color", sa.String(length=20), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["owner_user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("owner_user_id", "name", name="uq_tags_owner_name"),
    )
    op.create_index("ix_tags_owner_user_id", "tags", ["owner_user_id"])

    op.create_table(
        "project_files",
        sa.Column("project_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("file_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["file_id"], ["files.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("project_id", "file_id", name="uq_project_files_project_file"),
    )
    op.create_index("ix_project_files_project_id", "project_files", ["project_id"])
    op.create_index("ix_project_files_file_id", "project_files", ["file_id"])

    op.create_table(
        "note_files",
        sa.Column("note_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("file_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["file_id"], ["files.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["note_id"], ["notes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("note_id", "file_id", name="uq_note_files_note_file"),
    )
    op.create_index("ix_note_files_note_id", "note_files", ["note_id"])
    op.create_index("ix_note_files_file_id", "note_files", ["file_id"])

    op.create_table(
        "note_tags",
        sa.Column("note_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tag_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["note_id"], ["notes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("note_id", "tag_id", name="uq_note_tags_note_tag"),
    )
    op.create_index("ix_note_tags_note_id", "note_tags", ["note_id"])
    op.create_index("ix_note_tags_tag_id", "note_tags", ["tag_id"])

    op.create_table(
        "task_files",
        sa.Column("task_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("file_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["file_id"], ["files.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["task_id"], ["tasks.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("task_id", "file_id", name="uq_task_files_task_file"),
    )
    op.create_index("ix_task_files_task_id", "task_files", ["task_id"])
    op.create_index("ix_task_files_file_id", "task_files", ["file_id"])

    op.execute(
        """
        CREATE INDEX notes_fts_idx ON notes
        USING gin(to_tsvector('russian', title || ' ' || coalesce(content, '')))
        """
    )
    op.execute(
        """
        CREATE INDEX tasks_fts_idx ON tasks
        USING gin(to_tsvector('russian', title || ' ' || coalesce(description, '')))
        """
    )
    op.execute(
        """
        CREATE INDEX projects_fts_idx ON projects
        USING gin(to_tsvector('russian', title || ' ' || coalesce(description, '')))
        """
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS projects_fts_idx")
    op.execute("DROP INDEX IF EXISTS tasks_fts_idx")
    op.execute("DROP INDEX IF EXISTS notes_fts_idx")

    op.drop_table("task_files")
    op.drop_table("note_tags")
    op.drop_table("note_files")
    op.drop_table("project_files")
    op.drop_table("tags")
    op.drop_table("files")
    op.drop_table("tasks")
    op.drop_table("notes")
    op.drop_table("projects")
    op.drop_table("users")

    for enum_name in (
        "file_source",
        "task_priority",
        "task_status",
        "note_status",
        "project_status",
        "project_kind",
    ):
        postgresql.ENUM(name=enum_name).drop(op.get_bind(), checkfirst=True)
