import re
import uuid
from dataclasses import dataclass
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

HEX_COLOR_PATTERN = re.compile(r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")


class TagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    color: str
    created_at: datetime


class TagsListResponse(BaseModel):
    items: list[TagResponse]


class TagCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    color: str = Field(min_length=4, max_length=20)

    @field_validator("color")
    @classmethod
    def validate_color(cls, value: str) -> str:
        if not HEX_COLOR_PATTERN.fullmatch(value):
            raise ValueError("Color must be HEX")
        return value


class TagUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    color: str | None = Field(default=None, min_length=4, max_length=20)

    @field_validator("color")
    @classmethod
    def validate_color(cls, value: str | None) -> str | None:
        if value is not None and not HEX_COLOR_PATTERN.fullmatch(value):
            raise ValueError("Color must be HEX")
        return value


class TagAttachRequest(BaseModel):
    tag_id: uuid.UUID


class NoteTagLinkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    note_id: uuid.UUID
    tag_id: uuid.UUID
    created_at: datetime


@dataclass(frozen=True, slots=True, kw_only=True)
class CreateTagCommand:
    name: str
    color: str


@dataclass(frozen=True, slots=True, kw_only=True)
class UpdateTagCommand:
    name: str | None = None
    color: str | None = None
