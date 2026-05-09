from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import Settings
from app.ioc.container import AppContainer
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


def build_container(*, settings: Settings, session: AsyncSession) -> AppContainer:
    user_repository = UserRepository(session=session)
    project_repository = ProjectRepository(session=session)
    note_repository = NoteRepository(session=session)
    task_repository = TaskRepository(session=session)
    tag_repository = TagRepository(session=session)
    file_repository = FileRepository(session=session)
    file_storage_repository = FileStorageRepository(settings=settings.uploads)
    search_repository = SearchRepository(session=session)

    auth_service = AuthService(
        user_repository=user_repository,
        settings=settings.auth,
    )
    project_service = ProjectService(
        project_repository=project_repository,
        task_repository=task_repository,
        file_repository=file_repository,
    )
    note_service = NoteService(
        note_repository=note_repository,
        project_repository=project_repository,
        tag_repository=tag_repository,
        file_repository=file_repository,
    )
    task_service = TaskService(
        task_repository=task_repository,
        project_repository=project_repository,
        file_repository=file_repository,
    )
    tag_service = TagService(tag_repository=tag_repository)
    file_service = FileService(
        file_repository=file_repository,
        storage_repository=file_storage_repository,
        project_repository=project_repository,
        settings=settings.uploads,
    )
    search_service = SearchService(search_repository=search_repository)

    return AppContainer(
        settings=settings,
        user_repository=user_repository,
        project_repository=project_repository,
        note_repository=note_repository,
        task_repository=task_repository,
        tag_repository=tag_repository,
        file_repository=file_repository,
        file_storage_repository=file_storage_repository,
        search_repository=search_repository,
        auth_service=auth_service,
        project_service=project_service,
        note_service=note_service,
        task_service=task_service,
        tag_service=tag_service,
        file_service=file_service,
        search_service=search_service,
    )
