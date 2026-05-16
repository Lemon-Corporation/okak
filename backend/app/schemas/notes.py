import uuid
from dataclasses import dataclass
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.enums import NoteStatus
from app.schemas.files import FileBriefResponse
from app.schemas.tags import TagResponse


class NoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    title: str
    content: str
    status: NoteStatus
    created_at: datetime
    updated_at: datetime
    archived_at: datetime | None
    is_pinned: bool = False
    tags: list[TagResponse] = Field(default_factory=list)


class NoteFullResponse(NoteResponse):
    files: list[FileBriefResponse] = Field(default_factory=list)


class PaginatedNotesResponse(BaseModel):
    items: list[NoteResponse]
    total: int
    limit: int
    offset: int


class NoteCreateRequest(BaseModel):
    project_id: uuid.UUID
    title: str = Field(max_length=255)
    content: str = ""
    status: NoteStatus = NoteStatus.DRAFT


class NoteUpdateRequest(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    content: str | None = None
    status: NoteStatus | None = None
    is_pinned: bool | None = None


@dataclass(frozen=True, slots=True, kw_only=True)
class CreateNoteCommand:
    owner_user_id: uuid.UUID
    project_id: uuid.UUID
    title: str
    content: str
    status: NoteStatus
    is_pinned: bool = False


@dataclass(frozen=True, slots=True, kw_only=True)
class UpdateNoteCommand:
    owner_user_id: uuid.UUID
    title: str | None = None
    content: str | None = None
    status: NoteStatus | None = None
    is_pinned: bool | None = None


@dataclass(frozen=True, slots=True, kw_only=True)
class NoteFilters:
    owner_user_id: uuid.UUID
    project_id: uuid.UUID | None = None
    status: NoteStatus | None = None
    tag_id: uuid.UUID | None = None
    archived: bool = False
    q: str | None = None
    limit: int = 50
    offset: int = 0
