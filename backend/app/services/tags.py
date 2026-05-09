import uuid
from dataclasses import dataclass

from app.exceptions.base import UserAppError
from app.repository.tags import TagRepository
from app.schemas.tags import (
    CreateTagCommand,
    TagResponse,
    TagsListResponse,
    UpdateTagCommand,
)


@dataclass(slots=True, kw_only=True)
class TagService:
    tag_repository: TagRepository

    async def list_tags(self, owner_user_id: uuid.UUID) -> TagsListResponse:
        tags = await self.tag_repository.list(owner_user_id)
        return TagsListResponse(items=[TagResponse.model_validate(tag) for tag in tags])

    async def create_tag(
        self,
        *,
        owner_user_id: uuid.UUID,
        command: CreateTagCommand,
    ) -> TagResponse:
        tag = await self.tag_repository.create(
            owner_user_id=owner_user_id,
            name=command.name,
            color=command.color,
        )
        if tag is None:
            raise UserAppError(code="already_exists", message="Tag already exists")
        return TagResponse.model_validate(tag)

    async def update_tag(
        self,
        *,
        tag_id: uuid.UUID,
        owner_user_id: uuid.UUID,
        command: UpdateTagCommand,
    ) -> TagResponse:
        tag = await self.tag_repository.get_owned(tag_id=tag_id, owner_user_id=owner_user_id)
        if tag is None:
            raise UserAppError(code="not_found", message="Tag not found")

        if command.name is not None:
            tag.name = command.name
        if command.color is not None:
            tag.color = command.color

        updated_tag = await self.tag_repository.update(tag)
        if updated_tag is None:
            raise UserAppError(code="already_exists", message="Tag already exists")
        return TagResponse.model_validate(updated_tag)

    async def delete_tag(self, *, tag_id: uuid.UUID, owner_user_id: uuid.UUID) -> None:
        tag = await self.tag_repository.get_owned(tag_id=tag_id, owner_user_id=owner_user_id)
        if tag is None:
            raise UserAppError(code="not_found", message="Tag not found")
        await self.tag_repository.delete(tag)
