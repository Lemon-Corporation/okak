import uuid
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from pydantic import BaseModel, ConfigDict

from app.schemas.enums import FileSource


class FileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    original_name: str
    storage_key: str
    mime_type: str | None
    extension: str | None
    size_bytes: int
    checksum_sha256: str | None
    source: FileSource
    created_at: datetime
    updated_at: datetime


class FileBriefResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    original_name: str
    mime_type: str | None
    size_bytes: int
    created_at: datetime


class ProjectFileLinkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    file_id: uuid.UUID
    created_at: datetime


class NoteFileLinkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    note_id: uuid.UUID
    file_id: uuid.UUID
    created_at: datetime


class TaskFileLinkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    task_id: uuid.UUID
    file_id: uuid.UUID
    created_at: datetime


class FileAttachRequest(BaseModel):
    file_id: uuid.UUID


class PaginatedFilesResponse(BaseModel):
    items: list[FileResponse]
    total: int
    limit: int
    offset: int


@dataclass(frozen=True, slots=True, kw_only=True)
class UploadFileCommand:
    project_id: uuid.UUID
    original_name: str
    mime_type: str | None
    content: bytes


@dataclass(frozen=True, slots=True, kw_only=True)
class FileDownload:
    path: Path
    original_name: str
    mime_type: str | None
    size_bytes: int
