from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tag import NoteTag, Tag


@dataclass(slots=True, kw_only=True)
class TagRepository:
    session: AsyncSession

    async def list(self, owner_user_id: uuid.UUID) -> list[Tag]:
        result = await self.session.execute(
            select(Tag).where(Tag.owner_user_id == owner_user_id).order_by(Tag.name)
        )
        return list(result.scalars().all())

    async def get_owned(self, *, tag_id: uuid.UUID, owner_user_id: uuid.UUID) -> Tag | None:
        result = await self.session.execute(
            select(Tag).where(Tag.id == tag_id, Tag.owner_user_id == owner_user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(self, *, owner_user_id: uuid.UUID, name: str) -> Tag | None:
        result = await self.session.execute(
            select(Tag).where(Tag.owner_user_id == owner_user_id, Tag.name == name)
        )
        return result.scalar_one_or_none()

    async def create(self, *, owner_user_id: uuid.UUID, name: str, color: str) -> Tag | None:
        tag = Tag(owner_user_id=owner_user_id, name=name, color=color)
        self.session.add(tag)
        try:
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            return None
        await self.session.refresh(tag)
        return tag

    async def update(self, tag: Tag) -> Tag | None:
        try:
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            return None
        await self.session.refresh(tag)
        return tag

    async def delete(self, tag: Tag) -> None:
        await self.session.execute(delete(NoteTag).where(NoteTag.tag_id == tag.id))
        await self.session.delete(tag)
        await self.session.commit()
