import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.ioc.container import AppContainer
from app.presentation.dependencies import get_container, get_current_user
from app.schemas.auth import UserRecord
from app.schemas.tags import (
    CreateTagCommand,
    TagCreateRequest,
    TagResponse,
    TagUpdateRequest,
    TagsListResponse,
    UpdateTagCommand,
)

router = APIRouter()


@router.get("", response_model=TagsListResponse)
async def list_tags(
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> TagsListResponse:
    return await container.tag_service.list_tags(current_user.id)


@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    body: TagCreateRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> TagResponse:
    return await container.tag_service.create_tag(
        owner_user_id=current_user.id,
        command=CreateTagCommand(name=body.name, color=body.color),
    )


@router.patch("/{tag_id}", response_model=TagResponse)
async def update_tag(
    tag_id: uuid.UUID,
    body: TagUpdateRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> TagResponse:
    return await container.tag_service.update_tag(
        tag_id=tag_id,
        owner_user_id=current_user.id,
        command=UpdateTagCommand(name=body.name, color=body.color),
    )


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> Response:
    await container.tag_service.delete_tag(tag_id=tag_id, owner_user_id=current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
