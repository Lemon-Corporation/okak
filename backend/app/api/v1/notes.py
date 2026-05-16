import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status

from app.ioc.container import AppContainer
from app.presentation.dependencies import get_container, get_current_user
from app.schemas.auth import UserRecord
from app.schemas.enums import NoteStatus
from app.schemas.files import FileAttachRequest, NoteFileLinkResponse
from app.schemas.notes import (
    CreateNoteCommand,
    NoteCreateRequest,
    NoteFilters,
    NoteFullResponse,
    NoteResponse,
    NoteUpdateRequest,
    PaginatedNotesResponse,
    UpdateNoteCommand,
)
from app.schemas.tags import NoteTagLinkResponse, TagAttachRequest

router = APIRouter()


@router.get("", response_model=PaginatedNotesResponse)
async def list_notes(
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
    project_id: uuid.UUID | None = None,
    status_filter: Annotated[NoteStatus | None, Query(alias="status")] = None,
    tag_id: uuid.UUID | None = None,
    archived: bool = False,
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> PaginatedNotesResponse:
    return await container.note_service.list_notes(
        NoteFilters(
            owner_user_id=current_user.id,
            project_id=project_id,
            status=status_filter,
            tag_id=tag_id,
            archived=archived,
            q=q,
            limit=limit,
            offset=offset,
        )
    )


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    body: NoteCreateRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> NoteResponse:
    return await container.note_service.create_note(
        CreateNoteCommand(
            owner_user_id=current_user.id,
            project_id=body.project_id,
            title=body.title,
            content=body.content,
            status=body.status,
            is_pinned=getattr(body, 'is_pinned', False),
        )
    )


@router.get("/{note_id}", response_model=NoteFullResponse)
async def get_note(
    note_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> NoteFullResponse:
    return await container.note_service.get_note(
        note_id=note_id,
        owner_user_id=current_user.id,
    )


@router.patch("/{note_id}", response_model=NoteFullResponse)
async def update_note(
    note_id: uuid.UUID,
    body: NoteUpdateRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> NoteFullResponse:
    return await container.note_service.update_note(
        note_id=note_id,
        command=UpdateNoteCommand(
            owner_user_id=current_user.id,
            title=body.title,
            content=body.content,
            status=body.status,
            is_pinned=body.is_pinned,
        ),
    )


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> Response:
    await container.note_service.delete_note(note_id=note_id, owner_user_id=current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{note_id}/tags",
    response_model=NoteTagLinkResponse,
    status_code=status.HTTP_201_CREATED,
)
async def attach_note_tag(
    note_id: uuid.UUID,
    body: TagAttachRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> NoteTagLinkResponse:
    return await container.note_service.attach_tag(
        note_id=note_id,
        tag_id=body.tag_id,
        owner_user_id=current_user.id,
    )


@router.delete("/{note_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def detach_note_tag(
    note_id: uuid.UUID,
    tag_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> Response:
    await container.note_service.detach_tag(
        note_id=note_id,
        tag_id=tag_id,
        owner_user_id=current_user.id,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{note_id}/files",
    response_model=NoteFileLinkResponse,
    status_code=status.HTTP_201_CREATED,
)
async def attach_note_file(
    note_id: uuid.UUID,
    body: FileAttachRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> NoteFileLinkResponse:
    return await container.note_service.attach_file(
        note_id=note_id,
        file_id=body.file_id,
        owner_user_id=current_user.id,
    )


@router.delete("/{note_id}/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def detach_note_file(
    note_id: uuid.UUID,
    file_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> Response:
    await container.note_service.detach_file(
        note_id=note_id,
        file_id=file_id,
        owner_user_id=current_user.id,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
