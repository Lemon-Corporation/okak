import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status

from app.exceptions.base import UserAppError
from app.ioc.container import AppContainer
from app.presentation.dependencies import get_container, get_current_user
from app.schemas.auth import UserRecord
from app.schemas.enums import NoteStatus, ProjectKind, ProjectStatus, TaskPriority, TaskStatus
from app.schemas.files import FileAttachRequest, PaginatedFilesResponse, ProjectFileLinkResponse
from app.schemas.notes import NoteFilters, PaginatedNotesResponse
from app.schemas.projects import (
    CreateProjectCommand,
    PaginatedProjectsResponse,
    ProjectCreateRequest,
    ProjectFilters,
    ProjectResponse,
    ProjectTaskFilters,
    ProjectUpdateRequest,
    UpdateProjectCommand,
)
from app.schemas.tasks import PaginatedTasksResponse

router = APIRouter()


@router.get("", response_model=PaginatedProjectsResponse)
async def list_projects(
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
    kind: ProjectKind | None = None,
    status_filter: Annotated[ProjectStatus | None, Query(alias="status")] = None,
    parent_project_id: str | None = None,
    archived: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> PaginatedProjectsResponse:
    parent_id, parent_id_set = _parse_parent_project_id(parent_project_id)
    return await container.project_service.list_projects(
        ProjectFilters(
            owner_user_id=current_user.id,
            kind=kind,
            status=status_filter,
            parent_project_id=parent_id,
            parent_project_id_set=parent_id_set,
            archived=archived,
            limit=limit,
            offset=offset,
        )
    )


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectCreateRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> ProjectResponse:
    return await container.project_service.create_project(
        CreateProjectCommand(
            owner_user_id=current_user.id,
            kind=body.kind,
            title=body.title,
            description=body.description,
            parent_project_id=body.parent_project_id,
            status=body.status,
        )
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> ProjectResponse:
    return await container.project_service.get_project(
        project_id=project_id,
        owner_user_id=current_user.id,
    )


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    body: ProjectUpdateRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> ProjectResponse:
    return await container.project_service.update_project(
        project_id=project_id,
        command=UpdateProjectCommand(
            owner_user_id=current_user.id,
            title=body.title,
            description=body.description,
            status=body.status,
            kind=body.kind,
            parent_project_id=body.parent_project_id,
            parent_project_id_set="parent_project_id" in body.model_fields_set,
        ),
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> Response:
    await container.project_service.archive_project(
        project_id=project_id,
        owner_user_id=current_user.id,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{project_id}/notes", response_model=PaginatedNotesResponse)
async def list_project_notes(
    project_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
    status_filter: Annotated[NoteStatus | None, Query(alias="status")] = None,
    archived: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> PaginatedNotesResponse:
    return await container.note_service.list_notes(
        NoteFilters(
            owner_user_id=current_user.id,
            project_id=project_id,
            status=status_filter,
            archived=archived,
            limit=limit,
            offset=offset,
        )
    )


@router.get("/{project_id}/tasks", response_model=PaginatedTasksResponse)
async def list_project_tasks(
    project_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
    status_filter: Annotated[TaskStatus | None, Query(alias="status")] = None,
    priority: TaskPriority | None = None,
    archived: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> PaginatedTasksResponse:
    return await container.project_service.list_project_tasks(
        ProjectTaskFilters(
            owner_user_id=current_user.id,
            project_id=project_id,
            status=status_filter,
            priority=priority,
            archived=archived,
            limit=limit,
            offset=offset,
        )
    )


@router.get("/{project_id}/files", response_model=PaginatedFilesResponse)
async def list_project_files(
    project_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
    limit: int = 50,
    offset: int = 0,
) -> PaginatedFilesResponse:
    return await container.project_service.list_project_files(
        project_id=project_id,
        owner_user_id=current_user.id,
        limit=limit,
        offset=offset,
    )


@router.post(
    "/{project_id}/files",
    response_model=ProjectFileLinkResponse,
    status_code=status.HTTP_201_CREATED,
)
async def attach_project_file(
    project_id: uuid.UUID,
    body: FileAttachRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> ProjectFileLinkResponse:
    return await container.project_service.attach_file(
        project_id=project_id,
        file_id=body.file_id,
        owner_user_id=current_user.id,
    )


@router.delete("/{project_id}/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def detach_project_file(
    project_id: uuid.UUID,
    file_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> Response:
    await container.project_service.detach_file(
        project_id=project_id,
        file_id=file_id,
        owner_user_id=current_user.id,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def _parse_parent_project_id(value: str | None) -> tuple[uuid.UUID | None, bool]:
    if value is None:
        return None, False
    if value == "null":
        return None, True
    try:
        return uuid.UUID(value), True
    except ValueError as error:
        raise UserAppError(code="not_found", message="Invalid parent_project_id") from error
