from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import Select, delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.file import File, TaskFile
from app.models.note import Note
from app.models.project import Project
from app.models.task import Task
from app.schemas.enums import TaskPriority, TaskStatus
from app.schemas.tasks import TaskFilters


@dataclass(slots=True, kw_only=True)
class TaskRepository:
    session: AsyncSession

    async def get_owned(self, *, task_id: uuid.UUID, owner_user_id: uuid.UUID) -> Task | None:
        result = await self.session.execute(
            select(Task)
            .join(Project, Task.project_id == Project.id)
            .where(Task.id == task_id, Project.owner_user_id == owner_user_id)
        )
        return result.scalar_one_or_none()

    async def list(self, filters: TaskFilters) -> tuple[list[Task], int]:
        query = self._filtered_query(filters)
        total = await self._count(query)
        result = await self.session.execute(
            query.order_by(Task.updated_at.desc()).limit(filters.limit).offset(filters.offset)
        )
        return list(result.scalars().all()), total

    async def create(
        self,
        *,
        project_id: uuid.UUID,
        linked_note_id: uuid.UUID | None,
        title: str,
        description: str,
        status: TaskStatus,
        priority: TaskPriority,
        due_at: datetime | None,
    ) -> Task:
        completed_at = datetime.now(timezone.utc) if status == TaskStatus.DONE else None
        archived_at = datetime.now(timezone.utc) if status == TaskStatus.CANCELLED else None
        task = Task(
            project_id=project_id,
            linked_note_id=linked_note_id,
            title=title,
            description=description,
            status=status,
            priority=priority,
            due_at=due_at,
            completed_at=completed_at,
            archived_at=archived_at,
        )
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def update(self, task: Task) -> Task:
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def soft_delete(self, task: Task) -> None:
        task.status = TaskStatus.CANCELLED
        task.archived_at = datetime.now(timezone.utc)
        task.completed_at = None
        await self.session.commit()

    async def note_belongs_to_project(self, *, note_id: uuid.UUID, project_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            select(Note.id).where(Note.id == note_id, Note.project_id == project_id)
        )
        return result.scalar_one_or_none() is not None

    async def get_files_for_task(self, task_id: uuid.UUID) -> list[File]:
        result = await self.session.execute(
            select(File)
            .join(TaskFile, TaskFile.file_id == File.id)
            .where(TaskFile.task_id == task_id)
            .order_by(File.created_at.desc())
        )
        return list(result.scalars().all())

    async def attach_file(self, *, task_id: uuid.UUID, file_id: uuid.UUID) -> TaskFile | None:
        link = TaskFile(task_id=task_id, file_id=file_id)
        self.session.add(link)
        try:
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            return None
        await self.session.refresh(link)
        return link

    async def detach_file(self, *, task_id: uuid.UUID, file_id: uuid.UUID) -> None:
        await self.session.execute(
            delete(TaskFile).where(TaskFile.task_id == task_id, TaskFile.file_id == file_id)
        )
        await self.session.commit()

    def _filtered_query(self, filters: TaskFilters) -> Select[tuple[Task]]:
        query = select(Task).join(Project, Task.project_id == Project.id)
        query = query.where(Project.owner_user_id == filters.owner_user_id)
        if filters.project_id is not None:
            query = query.where(Task.project_id == filters.project_id)
        if filters.status is not None:
            query = query.where(Task.status == filters.status)
        if filters.priority is not None:
            query = query.where(Task.priority == filters.priority)
        if filters.linked_note_id is not None:
            query = query.where(Task.linked_note_id == filters.linked_note_id)
        if filters.due_before is not None:
            query = query.where(Task.due_at <= filters.due_before)
        if filters.due_after is not None:
            query = query.where(Task.due_at >= filters.due_after)
        if not filters.archived:
            query = query.where(Task.archived_at.is_(None))
        return query

    async def _count(self, query: Select[tuple[Task]]) -> int:
        result = await self.session.execute(select(func.count()).select_from(query.subquery()))
        return int(result.scalar_one())
