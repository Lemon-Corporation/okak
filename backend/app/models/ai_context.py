import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.mixins import WithTimestamps, WithUUID


class ProjectAIContext(WithUUID, WithTimestamps, Base):
    __tablename__ = "project_ai_contexts"
    __table_args__ = (
        Index("ix_project_ai_contexts_owner_user_id", "owner_user_id"),
        Index("ix_project_ai_contexts_project_id", "project_id", unique=True),
        Index("ix_project_ai_contexts_status", "status"),
    )

    owner_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="stale", server_default="stale")
    summary: Mapped[str] = mapped_column(Text, nullable=False, default="", server_default="")
    source_counts: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )
    tokens_estimate: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    last_rebuilt_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    marked_stale_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
