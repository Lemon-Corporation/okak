import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

from app.exceptions.base import UserAppError
from app.models.project import Project
from app.repository.files import FileRepository
from app.repository.projects import ProjectRepository
from app.repository.tasks import TaskRepository
from app.schemas.enums import ProjectStatus
from app.schemas.files import FileResponse, PaginatedFilesResponse, ProjectFileLinkResponse
from app.schemas.projects import (
    CreateProjectCommand,
    PaginatedProjectsResponse,
    ProjectFilters,
    ProjectResponse,
    ProjectTaskFilters,
    UpdateProjectCommand,
)
from app.schemas.tasks import PaginatedTasksResponse, TaskFilters, TaskResponse


@dataclass(slots=True, kw_only=True)
class ProjectService:
    project_repository: ProjectRepository
    task_repository: TaskRepository
    file_repository: FileRepository

    async def list_projects(self, filters: ProjectFilters) -> PaginatedProjectsResponse:
        projects, total = await self.project_repository.list(filters)
        return PaginatedProjectsResponse(
            items=[ProjectResponse.model_validate(project) for project in projects],
            total=total,
            limit=filters.limit,
            offset=filters.offset,
        )

    async def create_project(self, command: CreateProjectCommand) -> ProjectResponse:
        if command.parent_project_id is not None:
            await self._ensure_owned(command.parent_project_id, command.owner_user_id)

        project = await self.project_repository.create(
            owner_user_id=command.owner_user_id,
            kind=command.kind,
            title=command.title,
            description=command.description,
            parent_project_id=command.parent_project_id,
            status=command.status,
        )
        return ProjectResponse.model_validate(project)

    async def get_project(self, *, project_id: uuid.UUID, owner_user_id: uuid.UUID) -> ProjectResponse:
        project = await self._ensure_owned(project_id, owner_user_id)
        return ProjectResponse.model_validate(project)

    async def update_project(
        self,
        *,
        project_id: uuid.UUID,
        command: UpdateProjectCommand,
    ) -> ProjectResponse:
        project = await self._ensure_owned(project_id, command.owner_user_id)

        if command.parent_project_id_set:
            if command.parent_project_id == project_id:
                raise UserAppError(code="forbidden", message="Project cannot be its own parent")
            if command.parent_project_id is not None:
                await self._ensure_owned(command.parent_project_id, command.owner_user_id)
                is_descendant = await self.project_repository.is_descendant(
                    project_id=project_id,
                    candidate_parent_id=command.parent_project_id,
                )
                if is_descendant:
                    raise UserAppError(code="forbidden", message="Project parent creates a cycle")
            project.parent_project_id = command.parent_project_id

        if command.title is not None:
            project.title = command.title
        if command.description is not None:
            project.description = command.description
        if command.kind is not None:
            project.kind = command.kind
        if command.status is not None:
            project.status = command.status
            project.archived_at = (
                datetime.now(timezone.utc)
                if command.status == ProjectStatus.ARCHIVED
                else None
            )

        project = await self.project_repository.update(project)
        return ProjectResponse.model_validate(project)

    async def archive_project(self, *, project_id: uuid.UUID, owner_user_id: uuid.UUID) -> None:
        await self._ensure_owned(project_id, owner_user_id)
        await self.project_repository.archive_tree(project_id=project_id)

    async def list_project_tasks(
        self,
        filters: ProjectTaskFilters,
    ) -> PaginatedTasksResponse:
        await self._ensure_owned(filters.project_id, filters.owner_user_id)
        tasks, total = await self.task_repository.list(
            TaskFilters(
                owner_user_id=filters.owner_user_id,
                project_id=filters.project_id,
                status=filters.status,
                priority=filters.priority,
                archived=filters.archived,
                limit=filters.limit,
                offset=filters.offset,
            )
        )
        return PaginatedTasksResponse(
            items=[TaskResponse.model_validate(task) for task in tasks],
            total=total,
            limit=filters.limit,
            offset=filters.offset,
        )

    async def list_project_files(
        self,
        *,
        project_id: uuid.UUID,
        owner_user_id: uuid.UUID,
        limit: int,
        offset: int,
    ) -> PaginatedFilesResponse:
        await self._ensure_owned(project_id, owner_user_id)
        files, total = await self.file_repository.list_project_files(
            project_id=project_id,
            limit=limit,
            offset=offset,
        )
        return PaginatedFilesResponse(
            items=[FileResponse.model_validate(file) for file in files],
            total=total,
            limit=limit,
            offset=offset,
        )

    async def attach_file(
        self,
        *,
        project_id: uuid.UUID,
        file_id: uuid.UUID,
        owner_user_id: uuid.UUID,
    ) -> ProjectFileLinkResponse:
        await self._ensure_owned(project_id, owner_user_id)
        file = await self.file_repository.get_owned(file_id=file_id, owner_user_id=owner_user_id)
        if file is None:
            raise UserAppError(code="not_found", message="File not found")
        link = await self.file_repository.attach_project_file(
            project_id=project_id,
            file_id=file_id,
        )
        if link is None:
            raise UserAppError(code="already_exists", message="File already attached to project")
        return ProjectFileLinkResponse.model_validate(link)

    async def detach_file(
        self,
        *,
        project_id: uuid.UUID,
        file_id: uuid.UUID,
        owner_user_id: uuid.UUID,
    ) -> None:
        await self._ensure_owned(project_id, owner_user_id)
        await self.file_repository.detach_project_file(project_id=project_id, file_id=file_id)

    async def _ensure_owned(self, project_id: uuid.UUID, owner_user_id: uuid.UUID) -> Project:
        project = await self.project_repository.get(project_id)
        if project is None:
            raise UserAppError(code="not_found", message="Project not found")
        if project.owner_user_id != owner_user_id:
            raise UserAppError(code="forbidden", message="Access denied")
        return project
