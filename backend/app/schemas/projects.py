import uuid
from dataclasses import dataclass
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.enums import ProjectKind, ProjectStatus, TaskPriority, TaskStatus


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_user_id: uuid.UUID
    parent_project_id: uuid.UUID | None
    kind: ProjectKind
    title: str
    description: str
    color: str
    status: ProjectStatus
    created_at: datetime
    updated_at: datetime
    archived_at: datetime | None


class PaginatedProjectsResponse(BaseModel):
    items: list[ProjectResponse]
    total: int
    limit: int
    offset: int


class ProjectCreateRequest(BaseModel):
    kind: ProjectKind = ProjectKind.PROJECT
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    color: str = "#3b82f6"
    parent_project_id: uuid.UUID | None = None
    status: ProjectStatus = ProjectStatus.ACTIVE


class ProjectUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    color: str | None = None
    status: ProjectStatus | None = None
    kind: ProjectKind | None = None
    parent_project_id: uuid.UUID | None = None


@dataclass(frozen=True, slots=True, kw_only=True)
class CreateProjectCommand:
    owner_user_id: uuid.UUID
    kind: ProjectKind
    title: str
    description: str
    color: str
    parent_project_id: uuid.UUID | None
    status: ProjectStatus


@dataclass(frozen=True, slots=True, kw_only=True)
class UpdateProjectCommand:
    owner_user_id: uuid.UUID
    title: str | None = None
    description: str | None = None
    color: str | None = None
    status: ProjectStatus | None = None
    kind: ProjectKind | None = None
    parent_project_id: uuid.UUID | None = None
    parent_project_id_set: bool = False


@dataclass(frozen=True, slots=True, kw_only=True)
class ProjectFilters:
    owner_user_id: uuid.UUID
    kind: ProjectKind | None = None
    status: ProjectStatus | None = None
    parent_project_id: uuid.UUID | None = None
    parent_project_id_set: bool = False
    archived: bool = False
    limit: int = 50
    offset: int = 0


@dataclass(frozen=True, slots=True, kw_only=True)
class ProjectTaskFilters:
    project_id: uuid.UUID
    owner_user_id: uuid.UUID
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    archived: bool = False
    limit: int = 50
    offset: int = 0
