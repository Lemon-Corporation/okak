import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

from app.exceptions.base import UserAppError
from app.models.file import File
from app.models.project import Project
from app.models.task import Task
from app.repository.files import FileRepository
from app.repository.projects import ProjectRepository
from app.repository.tasks import TaskRepository
from app.schemas.enums import TaskStatus
from app.schemas.files import FileBriefResponse, TaskFileLinkResponse
from app.schemas.tasks import (
    CreateTaskCommand,
    PaginatedTasksResponse,
    TaskFilters,
    TaskFullResponse,
    TaskResponse,
    UpdateTaskCommand,
)


@dataclass(slots=True, kw_only=True)
class TaskService:
    task_repository: TaskRepository
    project_repository: ProjectRepository
    file_repository: FileRepository

    async def list_tasks(self, filters: TaskFilters) -> PaginatedTasksResponse:
        if filters.project_id is not None:
            await self._ensure_project_owned(filters.project_id, filters.owner_user_id)
        tasks, total = await self.task_repository.list(filters)
        return PaginatedTasksResponse(
            items=[TaskResponse.model_validate(task) for task in tasks],
            total=total,
            limit=filters.limit,
            offset=filters.offset,
        )

    async def create_task(self, command: CreateTaskCommand) -> TaskResponse:
        await self._ensure_project_owned(command.project_id, command.owner_user_id)
        if command.linked_note_id is not None:
            note_belongs = await self.task_repository.note_belongs_to_project(
                note_id=command.linked_note_id,
                project_id=command.project_id,
            )
            if not note_belongs:
                raise UserAppError(code="not_found", message="Linked note not found")

        task = await self.task_repository.create(
            project_id=command.project_id,
            linked_note_id=command.linked_note_id,
            title=command.title,
            description=command.description,
            status=command.status,
            priority=command.priority,
            due_at=command.due_at,
        )
        return TaskResponse.model_validate(task)

    async def get_task(self, *, task_id: uuid.UUID, owner_user_id: uuid.UUID) -> TaskFullResponse:
        task = await self._ensure_task_owned(task_id, owner_user_id)
        files = await self.task_repository.get_files_for_task(task.id)
        return self._build_task_full_response(task, files)

    async def update_task(
        self,
        *,
        task_id: uuid.UUID,
        command: UpdateTaskCommand,
    ) -> TaskFullResponse:
        task = await self._ensure_task_owned(task_id, command.owner_user_id)
        if command.title is not None:
            task.title = command.title
        if command.description is not None:
            task.description = command.description
        if command.priority is not None:
            task.priority = command.priority
        if command.due_at_set:
            task.due_at = command.due_at
        if command.linked_note_id_set:
            if command.linked_note_id is not None:
                note_belongs = await self.task_repository.note_belongs_to_project(
                    note_id=command.linked_note_id,
                    project_id=task.project_id,
                )
                if not note_belongs:
                    raise UserAppError(code="not_found", message="Linked note not found")
            task.linked_note_id = command.linked_note_id
        if command.status is not None:
            self._apply_status(task, command.status)

        task = await self.task_repository.update(task)
        return await self.get_task(task_id=task.id, owner_user_id=command.owner_user_id)

    async def delete_task(self, *, task_id: uuid.UUID, owner_user_id: uuid.UUID) -> None:
        task = await self._ensure_task_owned(task_id, owner_user_id)
        await self.task_repository.soft_delete(task)

    async def attach_file(
        self,
        *,
        task_id: uuid.UUID,
        file_id: uuid.UUID,
        owner_user_id: uuid.UUID,
    ) -> TaskFileLinkResponse:
        await self._ensure_task_owned(task_id, owner_user_id)
        file = await self.file_repository.get_owned(file_id=file_id, owner_user_id=owner_user_id)
        if file is None:
            raise UserAppError(code="not_found", message="File not found")
        link = await self.task_repository.attach_file(task_id=task_id, file_id=file_id)
        if link is None:
            raise UserAppError(code="already_exists", message="File already attached to this task")
        return TaskFileLinkResponse.model_validate(link)

    async def detach_file(
        self,
        *,
        task_id: uuid.UUID,
        file_id: uuid.UUID,
        owner_user_id: uuid.UUID,
    ) -> None:
        await self._ensure_task_owned(task_id, owner_user_id)
        await self.task_repository.detach_file(task_id=task_id, file_id=file_id)

    async def _ensure_project_owned(
        self,
        project_id: uuid.UUID,
        owner_user_id: uuid.UUID,
    ) -> Project:
        project = await self.project_repository.get(project_id)
        if project is None:
            raise UserAppError(code="not_found", message="Project not found")
        if project.owner_user_id != owner_user_id:
            raise UserAppError(code="forbidden", message="Access denied")
        return project

    async def _ensure_task_owned(self, task_id: uuid.UUID, owner_user_id: uuid.UUID) -> Task:
        task = await self.task_repository.get_owned(task_id=task_id, owner_user_id=owner_user_id)
        if task is None:
            raise UserAppError(code="not_found", message="Task not found")
        return task

    def _apply_status(self, task: Task, status: TaskStatus) -> None:
        task.status = status
        if status == TaskStatus.DONE:
            task.completed_at = datetime.now(timezone.utc)
            task.archived_at = None
        elif status == TaskStatus.CANCELLED:
            task.completed_at = None
            task.archived_at = datetime.now(timezone.utc)
        else:
            task.completed_at = None
            task.archived_at = None

    def _build_task_full_response(self, task: Task, files: list[File]) -> TaskFullResponse:
        task_response = TaskResponse.model_validate(task)
        return TaskFullResponse(
            **task_response.model_dump(),
            files=[FileBriefResponse.model_validate(file) for file in files],
        )
