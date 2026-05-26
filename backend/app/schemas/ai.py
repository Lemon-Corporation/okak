import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, model_validator


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(default_factory=list)
    message: str | None = None
    conversation_id: uuid.UUID | None = None

    @model_validator(mode="after")
    def validate_message_source(self) -> "ChatRequest":
        if self.message is None and not self.messages:
            raise ValueError("Either message or messages must be provided")
        return self


class AIUsedProject(BaseModel):
    id: uuid.UUID
    title: str


class AISource(BaseModel):
    type: str
    id: uuid.UUID
    title: str
    project_id: uuid.UUID | None = None


class AIAction(BaseModel):
    type: str  # 'create_note', 'create_task', 'create_project', 'navigate', 'search'
    payload: dict[str, Any] = Field(default_factory=dict)


class ChatResponse(BaseModel):
    role: str
    content: str
    conversation_id: uuid.UUID | None = None
    used_projects: list[AIUsedProject] = Field(default_factory=list)
    sources: list[AISource] = Field(default_factory=list)
    actions: list[AIAction] = Field(default_factory=list)


class TTSRequest(BaseModel):
    text: str


class ProjectAIContextStatusResponse(BaseModel):
    project_id: uuid.UUID
    status: str
    is_stale: bool
    summary: str | None = None
    source_counts: dict[str, Any] = Field(default_factory=dict)
    tokens_estimate: int = 0
    last_rebuilt_at: datetime | None = None
    marked_stale_at: datetime | None = None
    error_message: str | None = None


class ProjectAIContextPreviewResponse(ProjectAIContextStatusResponse):
    project_title: str
    project_description: str


class ProjectAIContextRebuildResponse(ProjectAIContextStatusResponse):
    pass
