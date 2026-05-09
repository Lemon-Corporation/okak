from enum import Enum


class ProjectKind(str, Enum):
    WORKSPACE = "workspace"
    PROJECT = "project"
    FOLDER = "folder"


class ProjectStatus(str, Enum):
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class NoteStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class TaskStatus(str, Enum):
    BACKLOG = "backlog"
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class FileSource(str, Enum):
    UPLOAD = "upload"
    GENERATED = "generated"


class SearchKind(str, Enum):
    NOTE = "note"
    TASK = "task"
    PROJECT = "project"
