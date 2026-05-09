from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import Select, delete, func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.file import File, NoteFile
from app.models.note import Note
from app.models.project import Project
from app.models.tag import NoteTag, Tag
from app.models.task import Task
from app.schemas.enums import NoteStatus
from app.schemas.notes import NoteFilters


@dataclass(slots=True, kw_only=True)
class NoteRepository:
    session: AsyncSession

    async def get_owned(self, *, note_id: uuid.UUID, owner_user_id: uuid.UUID) -> Note | None:
        result = await self.session.execute(
            select(Note)
            .join(Project, Note.project_id == Project.id)
            .where(Note.id == note_id, Project.owner_user_id == owner_user_id)
        )
        return result.scalar_one_or_none()

    async def list(self, filters: NoteFilters) -> tuple[list[Note], int]:
        query = self._filtered_query(filters)
        total = await self._count(query)
        result = await self.session.execute(
            query.order_by(Note.updated_at.desc()).limit(filters.limit).offset(filters.offset)
        )
        return list(result.scalars().unique().all()), total

    async def create(
        self,
        *,
        project_id: uuid.UUID,
        title: str,
        content: str,
        status: NoteStatus,
    ) -> Note:
        archived_at = datetime.now(timezone.utc) if status == NoteStatus.ARCHIVED else None
        note = Note(
            project_id=project_id,
            title=title,
            content=content,
            status=status,
            archived_at=archived_at,
        )
        self.session.add(note)
        await self.session.commit()
        await self.session.refresh(note)
        return note

    async def update(self, note: Note) -> Note:
        await self.session.commit()
        await self.session.refresh(note)
        return note

    async def soft_delete_and_unlink_tasks(self, note: Note) -> None:
        now = datetime.now(timezone.utc)
        note.status = NoteStatus.ARCHIVED
        note.archived_at = now
        await self.session.execute(
            update(Task).where(Task.linked_note_id == note.id).values(linked_note_id=None)
        )
        await self.session.commit()

    async def get_tags_for_notes(self, note_ids: list[uuid.UUID]) -> dict[uuid.UUID, list[Tag]]:
        if not note_ids:
            return {}

        result = await self.session.execute(
            select(NoteTag.note_id, Tag)
            .join(Tag, NoteTag.tag_id == Tag.id)
            .where(NoteTag.note_id.in_(note_ids))
            .order_by(Tag.name)
        )
        tags_by_note: dict[uuid.UUID, list[Tag]] = {note_id: [] for note_id in note_ids}
        for note_id, tag in result.all():
            tags_by_note.setdefault(note_id, []).append(tag)
        return tags_by_note

    async def get_files_for_note(self, note_id: uuid.UUID) -> list[File]:
        result = await self.session.execute(
            select(File)
            .join(NoteFile, NoteFile.file_id == File.id)
            .where(NoteFile.note_id == note_id)
            .order_by(File.created_at.desc())
        )
        return list(result.scalars().all())

    async def attach_tag(self, *, note_id: uuid.UUID, tag_id: uuid.UUID) -> NoteTag | None:
        link = NoteTag(note_id=note_id, tag_id=tag_id)
        self.session.add(link)
        try:
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            return None
        await self.session.refresh(link)
        return link

    async def detach_tag(self, *, note_id: uuid.UUID, tag_id: uuid.UUID) -> None:
        await self.session.execute(
            delete(NoteTag).where(NoteTag.note_id == note_id, NoteTag.tag_id == tag_id)
        )
        await self.session.commit()

    async def attach_file(self, *, note_id: uuid.UUID, file_id: uuid.UUID) -> NoteFile | None:
        link = NoteFile(note_id=note_id, file_id=file_id)
        self.session.add(link)
        try:
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            return None
        await self.session.refresh(link)
        return link

    async def detach_file(self, *, note_id: uuid.UUID, file_id: uuid.UUID) -> None:
        await self.session.execute(
            delete(NoteFile).where(NoteFile.note_id == note_id, NoteFile.file_id == file_id)
        )
        await self.session.commit()

    def _filtered_query(self, filters: NoteFilters) -> Select[tuple[Note]]:
        query = select(Note).join(Project, Note.project_id == Project.id)
        query = query.where(Project.owner_user_id == filters.owner_user_id)
        if filters.project_id is not None:
            query = query.where(Note.project_id == filters.project_id)
        if filters.status is not None:
            query = query.where(Note.status == filters.status)
        if filters.tag_id is not None:
            query = query.join(NoteTag, NoteTag.note_id == Note.id)
            query = query.where(NoteTag.tag_id == filters.tag_id)
        if filters.q:
            pattern = f"%{filters.q}%"
            query = query.where(Note.title.ilike(pattern) | Note.content.ilike(pattern))
        if not filters.archived:
            query = query.where(Note.archived_at.is_(None))
        return query

    async def _count(self, query: Select[tuple[Note]]) -> int:
        result = await self.session.execute(select(func.count()).select_from(query.subquery()))
        return int(result.scalar_one())
