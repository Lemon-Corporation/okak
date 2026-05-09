from dataclasses import dataclass

from app.config.settings import Settings
from app.repository.files import FileRepository, FileStorageRepository
from app.repository.notes import NoteRepository
from app.repository.projects import ProjectRepository
from app.repository.search import SearchRepository
from app.repository.tags import TagRepository
from app.repository.tasks import TaskRepository
from app.repository.users import UserRepository
from app.services.auth import AuthService
from app.services.files import FileService
from app.services.notes import NoteService
from app.services.projects import ProjectService
from app.services.search import SearchService
from app.services.tags import TagService
from app.services.tasks import TaskService


@dataclass(slots=True, kw_only=True)
class AppContainer:
    settings: Settings

    user_repository: UserRepository
    project_repository: ProjectRepository
    note_repository: NoteRepository
    task_repository: TaskRepository
    tag_repository: TagRepository
    file_repository: FileRepository
    file_storage_repository: FileStorageRepository
    search_repository: SearchRepository

    auth_service: AuthService
    project_service: ProjectService
    note_service: NoteService
    task_service: TaskService
    tag_service: TagService
    file_service: FileService
    search_service: SearchService
