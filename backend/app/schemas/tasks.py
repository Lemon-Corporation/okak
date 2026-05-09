import uuid
from dataclasses import dataclass
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.enums import TaskPriority, TaskStatus
from app.schemas.files import FileBriefResponse


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    linked_note_id: uuid.UUID | None
    title: str
    description: str
    status: TaskStatus
    priority: TaskPriority
    due_at: datetime | None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None
    archived_at: datetime | None


class TaskFullResponse(TaskResponse):
    files: list[FileBriefResponse] = Field(default_factory=list)


class PaginatedTasksResponse(BaseModel):
    items: list[TaskResponse]
    total: int
    limit: int
    offset: int


class TaskCreateRequest(BaseModel):
    project_id: uuid.UUID
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_at: datetime | None = None
    linked_note_id: uuid.UUID | None = None


class TaskUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    due_at: datetime | None = None
    linked_note_id: uuid.UUID | None = None


@dataclass(frozen=True, slots=True, kw_only=True)
class CreateTaskCommand:
    owner_user_id: uuid.UUID
    project_id: uuid.UUID
    title: str
    description: str
    status: TaskStatus
    priority: TaskPriority
    due_at: datetime | None
    linked_note_id: uuid.UUID | None


@dataclass(frozen=True, slots=True, kw_only=True)
class UpdateTaskCommand:
    owner_user_id: uuid.UUID
    title: str | None = None
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    due_at: datetime | None = None
    due_at_set: bool = False
    linked_note_id: uuid.UUID | None = None
    linked_note_id_set: bool = False


@dataclass(frozen=True, slots=True, kw_only=True)
class TaskFilters:
    owner_user_id: uuid.UUID
    project_id: uuid.UUID | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    linked_note_id: uuid.UUID | None = None
    due_before: datetime | None = None
    due_after: datetime | None = None
    archived: bool = False
    limit: int = 50
    offset: int = 0
