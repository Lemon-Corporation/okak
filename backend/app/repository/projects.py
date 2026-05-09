from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import Select, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.note import Note
from app.models.project import Project
from app.models.task import Task
from app.schemas.enums import NoteStatus, ProjectKind, ProjectStatus, TaskStatus
from app.schemas.projects import ProjectFilters


@dataclass(slots=True, kw_only=True)
class ProjectRepository:
    session: AsyncSession

    async def get(self, project_id: uuid.UUID) -> Project | None:
        return await self.session.get(Project, project_id)

    async def get_owned(self, *, project_id: uuid.UUID, owner_user_id: uuid.UUID) -> Project | None:
        result = await self.session.execute(
            select(Project).where(
                Project.id == project_id,
                Project.owner_user_id == owner_user_id,
            )
        )
        return result.scalar_one_or_none()

    async def list(self, filters: ProjectFilters) -> tuple[list[Project], int]:
        query = self._filtered_query(filters)
        total = await self._count(query)
        result = await self.session.execute(
            query.order_by(Project.updated_at.desc()).limit(filters.limit).offset(filters.offset)
        )
        return list(result.scalars().all()), total

    async def create(
        self,
        *,
        owner_user_id: uuid.UUID,
        kind: ProjectKind,
        title: str,
        description: str,
        parent_project_id: uuid.UUID | None,
        status: ProjectStatus,
    ) -> Project:
        archived_at = datetime.now(timezone.utc) if status == ProjectStatus.ARCHIVED else None
        project = Project(
            owner_user_id=owner_user_id,
            kind=kind,
            title=title,
            description=description,
            parent_project_id=parent_project_id,
            status=status,
            archived_at=archived_at,
        )
        self.session.add(project)
        await self.session.commit()
        await self.session.refresh(project)
        return project

    async def update(self, project: Project) -> Project:
        await self.session.commit()
        await self.session.refresh(project)
        return project

    async def is_descendant(
        self,
        *,
        project_id: uuid.UUID,
        candidate_parent_id: uuid.UUID,
    ) -> bool:
        current = await self.get(candidate_parent_id)
        while current is not None:
            if current.parent_project_id == project_id:
                return True
            if current.parent_project_id is None:
                return False
            current = await self.get(current.parent_project_id)
        return False

    async def archive_tree(self, *, project_id: uuid.UUID) -> None:
        project_ids = await self._collect_descendant_ids(project_id)
        now = datetime.now(timezone.utc)

        await self.session.execute(
            update(Project)
            .where(Project.id.in_(project_ids))
            .values(status=ProjectStatus.ARCHIVED, archived_at=now)
        )
        await self.session.execute(
            update(Note)
            .where(Note.project_id.in_(project_ids))
            .values(status=NoteStatus.ARCHIVED, archived_at=now)
        )
        await self.session.execute(
            update(Task)
            .where(Task.project_id.in_(project_ids))
            .values(status=TaskStatus.CANCELLED, archived_at=now, completed_at=None)
        )
        await self.session.commit()

    async def _collect_descendant_ids(self, project_id: uuid.UUID) -> list[uuid.UUID]:
        result = [project_id]
        queue = [project_id]
        while queue:
            parent_id = queue.pop(0)
            rows = await self.session.execute(
                select(Project.id).where(Project.parent_project_id == parent_id)
            )
            child_ids = list(rows.scalars().all())
            result.extend(child_ids)
            queue.extend(child_ids)
        return result

    def _filtered_query(self, filters: ProjectFilters) -> Select[tuple[Project]]:
        query = select(Project).where(Project.owner_user_id == filters.owner_user_id)
        if filters.kind is not None:
            query = query.where(Project.kind == filters.kind)
        if filters.status is not None:
            query = query.where(Project.status == filters.status)
        if filters.parent_project_id_set:
            query = query.where(Project.parent_project_id == filters.parent_project_id)
        if not filters.archived:
            query = query.where(Project.archived_at.is_(None))
        return query

    async def _count(self, query: Select[tuple[Project]]) -> int:
        result = await self.session.execute(select(func.count()).select_from(query.subquery()))
        return int(result.scalar_one())
