import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.enums import NoteStatus, ProjectKind, ProjectStatus, TaskPriority, TaskStatus


class SearchNoteResult(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    title: str
    content_excerpt: str
    status: NoteStatus
    is_pinned: bool
    updated_at: datetime


class SearchTaskResult(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    title: str
    status: TaskStatus
    priority: TaskPriority
    updated_at: datetime


class SearchProjectResult(BaseModel):
    id: uuid.UUID
    kind: ProjectKind
    title: str
    status: ProjectStatus
    color: str
    updated_at: datetime


class SearchResponse(BaseModel):
    notes: list[SearchNoteResult]
    tasks: list[SearchTaskResult]
    projects: list[SearchProjectResult]
