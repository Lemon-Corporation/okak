import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models._types import enum_values
from app.models.mixins import WithTimestamps, WithUUID
from app.schemas.enums import NoteStatus


class Note(WithUUID, WithTimestamps, Base):
    __tablename__ = "notes"
    __table_args__ = (
        Index("ix_notes_project_id", "project_id"),
        Index("ix_notes_status", "status"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False, default="", server_default="")
    status: Mapped[NoteStatus] = mapped_column(
        Enum(NoteStatus, name="note_status", values_callable=enum_values),
        nullable=False,
        default=NoteStatus.DRAFT,
        server_default=NoteStatus.DRAFT.value,
    )
    is_pinned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
