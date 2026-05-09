import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status

from app.ioc.container import AppContainer
from app.presentation.dependencies import get_container, get_current_user
from app.schemas.auth import UserRecord
from app.schemas.enums import TaskPriority, TaskStatus
from app.schemas.files import FileAttachRequest, TaskFileLinkResponse
from app.schemas.tasks import (
    CreateTaskCommand,
    PaginatedTasksResponse,
    TaskCreateRequest,
    TaskFilters,
    TaskFullResponse,
    TaskResponse,
    TaskUpdateRequest,
    UpdateTaskCommand,
)

router = APIRouter()


@router.get("", response_model=PaginatedTasksResponse)
async def list_tasks(
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
    project_id: uuid.UUID | None = None,
    status_filter: Annotated[TaskStatus | None, Query(alias="status")] = None,
    priority: TaskPriority | None = None,
    linked_note_id: uuid.UUID | None = None,
    due_before: datetime | None = None,
    due_after: datetime | None = None,
    archived: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> PaginatedTasksResponse:
    return await container.task_service.list_tasks(
        TaskFilters(
            owner_user_id=current_user.id,
            project_id=project_id,
            status=status_filter,
            priority=priority,
            linked_note_id=linked_note_id,
            due_before=due_before,
            due_after=due_after,
            archived=archived,
            limit=limit,
            offset=offset,
        )
    )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    body: TaskCreateRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> TaskResponse:
    return await container.task_service.create_task(
        CreateTaskCommand(
            owner_user_id=current_user.id,
            project_id=body.project_id,
            title=body.title,
            description=body.description,
            status=body.status,
            priority=body.priority,
            due_at=body.due_at,
            linked_note_id=body.linked_note_id,
        )
    )


@router.get("/{task_id}", response_model=TaskFullResponse)
async def get_task(
    task_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> TaskFullResponse:
    return await container.task_service.get_task(
        task_id=task_id,
        owner_user_id=current_user.id,
    )


@router.patch("/{task_id}", response_model=TaskFullResponse)
async def update_task(
    task_id: uuid.UUID,
    body: TaskUpdateRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> TaskFullResponse:
    return await container.task_service.update_task(
        task_id=task_id,
        command=UpdateTaskCommand(
            owner_user_id=current_user.id,
            title=body.title,
            description=body.description,
            status=body.status,
            priority=body.priority,
            due_at=body.due_at,
            due_at_set="due_at" in body.model_fields_set,
            linked_note_id=body.linked_note_id,
            linked_note_id_set="linked_note_id" in body.model_fields_set,
        ),
    )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> Response:
    await container.task_service.delete_task(task_id=task_id, owner_user_id=current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{task_id}/files",
    response_model=TaskFileLinkResponse,
    status_code=status.HTTP_201_CREATED,
)
async def attach_task_file(
    task_id: uuid.UUID,
    body: FileAttachRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> TaskFileLinkResponse:
    return await container.task_service.attach_file(
        task_id=task_id,
        file_id=body.file_id,
        owner_user_id=current_user.id,
    )


@router.delete("/{task_id}/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def detach_task_file(
    task_id: uuid.UUID,
    file_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> Response:
    await container.task_service.detach_file(
        task_id=task_id,
        file_id=file_id,
        owner_user_id=current_user.id,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
