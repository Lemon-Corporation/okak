from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import Settings
from app.ioc.container import AppContainer
from app.repository.ai_context import AIContextRepository
from app.repository.files import FileRepository, FileStorageRepository
from app.repository.notes import NoteRepository
from app.repository.projects import ProjectRepository
from app.repository.search import SearchRepository
from app.repository.tags import TagRepository
from app.repository.tasks import TaskRepository
from app.repository.users import UserRepository
from app.services.agents import AIAgentService, ProjectAgentService
from app.services.ai_context import AIContextService
from app.services.auth import AuthService
from app.services.email import EmailService
from app.services.files import FileService
from app.services.notes import NoteService
from app.services.projects import ProjectService
from app.services.search import SearchService
from app.services.tags import TagService
from app.services.tasks import TaskService
from app.services.llm import LLMClient


def build_container(*, settings: Settings, session: AsyncSession) -> AppContainer:
    user_repository = UserRepository(session=session)
    project_repository = ProjectRepository(session=session)
    note_repository = NoteRepository(session=session)
    task_repository = TaskRepository(session=session)
    tag_repository = TagRepository(session=session)
    file_repository = FileRepository(session=session)
    file_storage_repository = FileStorageRepository(settings=settings.uploads)
    search_repository = SearchRepository(session=session)
    ai_context_repository = AIContextRepository(session=session)
    llm_client = LLMClient(settings=settings.llm)
    email_service = EmailService(settings=settings.email)
    ai_context_service = AIContextService(
        ai_context_repository=ai_context_repository,
        llm_client=llm_client,
    )
    project_agent_service = ProjectAgentService(
        ai_context_repository=ai_context_repository,
        llm_client=llm_client,
    )
    auth_service = AuthService(
        user_repository=user_repository,
        settings=settings.auth,
        email_service=email_service,
    )
    project_service = ProjectService(
        project_repository=project_repository,
        task_repository=task_repository,
        file_repository=file_repository,
        ai_context_service=ai_context_service,
    )
    note_service = NoteService(
        note_repository=note_repository,
        project_repository=project_repository,
        tag_repository=tag_repository,
        file_repository=file_repository,
        ai_context_service=ai_context_service,
    )
    task_service = TaskService(
        task_repository=task_repository,
        project_repository=project_repository,
        file_repository=file_repository,
        ai_context_service=ai_context_service,
    )
    tag_service = TagService(tag_repository=tag_repository)
    file_service = FileService(
        file_repository=file_repository,
        storage_repository=file_storage_repository,
        project_repository=project_repository,
        settings=settings.uploads,
        ai_context_service=ai_context_service,
    )
    search_service = SearchService(search_repository=search_repository)

    ai_agent_service = AIAgentService(
        ai_context_repository=ai_context_repository,
        project_agent_service=project_agent_service,
        llm_client=llm_client,
        note_service=note_service,
        project_service=project_service,
        task_service=task_service,
    )

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
        ai_context_repository=ai_context_repository,
        auth_service=auth_service,
        llm_client=llm_client,
        ai_context_service=ai_context_service,
        project_agent_service=project_agent_service,
        ai_agent_service=ai_agent_service,
        project_service=project_service,
        note_service=note_service,
        task_service=task_service,
        tag_service=tag_service,
        file_service=file_service,
        search_service=search_service,
    )
