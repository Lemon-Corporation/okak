import uuid
from dataclasses import dataclass


@dataclass(frozen=True, slots=True, kw_only=True)
class Page:
    limit: int = 50
    offset: int = 0


@dataclass(frozen=True, slots=True, kw_only=True)
class LinkFileCommand:
    file_id: uuid.UUID
