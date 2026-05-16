import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models._types import enum_values
from app.models.mixins import WithTimestamps, WithUUID
from app.schemas.enums import ProjectKind, ProjectStatus


class Project(WithUUID, WithTimestamps, Base):
    __tablename__ = "projects"
    __table_args__ = (
        Index("ix_projects_owner_user_id", "owner_user_id"),
        Index("ix_projects_parent_project_id", "parent_project_id"),
        Index("ix_projects_status", "status"),
    )

    owner_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    parent_project_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
    )
    kind: Mapped[ProjectKind] = mapped_column(
        Enum(ProjectKind, name="project_kind", values_callable=enum_values),
        nullable=False,
        default=ProjectKind.PROJECT,
        server_default=ProjectKind.PROJECT.value,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="", server_default="")
    color: Mapped[str] = mapped_column(String(7), nullable=False, default="#3b82f6", server_default="#3b82f6")
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus, name="project_status", values_callable=enum_values),
        nullable=False,
        default=ProjectStatus.ACTIVE,
        server_default=ProjectStatus.ACTIVE.value,
    )
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
