import uuid

from sqlalchemy import BigInteger, Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models._types import enum_values
from app.models.mixins import WithCreatedAt, WithTimestamps, WithUUID
from app.schemas.enums import FileSource


class File(WithUUID, WithTimestamps, Base):
    __tablename__ = "files"

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    original_name: Mapped[str] = mapped_column(String(500), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(1000), nullable=False, unique=True)
    mime_type: Mapped[str | None] = mapped_column(String(255), nullable=True)
    extension: Mapped[str | None] = mapped_column(String(50), nullable=True)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    checksum_sha256: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    source: Mapped[FileSource] = mapped_column(
        Enum(FileSource, name="file_source", values_callable=enum_values),
        nullable=False,
        default=FileSource.UPLOAD,
        server_default=FileSource.UPLOAD.value,
    )


class ProjectFile(WithUUID, WithCreatedAt, Base):
    __tablename__ = "project_files"
    __table_args__ = (UniqueConstraint("project_id", "file_id", name="uq_project_files_project_file"),)

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    file_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("files.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )


class NoteFile(WithUUID, WithCreatedAt, Base):
    __tablename__ = "note_files"
    __table_args__ = (UniqueConstraint("note_id", "file_id", name="uq_note_files_note_file"),)

    note_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("notes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    file_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("files.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )


class TaskFile(WithUUID, WithCreatedAt, Base):
    __tablename__ = "task_files"
    __table_args__ = (UniqueConstraint("task_id", "file_id", name="uq_task_files_task_file"),)

    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    file_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("files.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
