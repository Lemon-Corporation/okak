import uuid
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_context import ProjectAIContext
from app.models.file import File
from app.models.note import Note
from app.models.project import Project
from app.models.task import Task


@dataclass(frozen=True, slots=True)
class ProjectAISummaryRecord:
    project: Project
    context: ProjectAIContext | None


@dataclass(frozen=True, slots=True)
class ProjectAIContextRecord:
    project: Project
    context: ProjectAIContext | None
    notes: list[Note]
    tasks: list[Task]
    files: list[File]


@dataclass(slots=True, kw_only=True)
class AIContextRepository:
    session: AsyncSession

    async def get_project_context(
        self,
        *,
        project_id: uuid.UUID,
        owner_user_id: uuid.UUID,
    ) -> ProjectAIContext | None:
        result = await self.session.execute(
            select(ProjectAIContext).where(
                ProjectAIContext.project_id == project_id,
                ProjectAIContext.owner_user_id == owner_user_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_project_summaries(
        self,
        *,
        owner_user_id: uuid.UUID,
        limit: int = 100,
    ) -> list[ProjectAISummaryRecord]:
        result = await self.session.execute(
            select(Project, ProjectAIContext)
            .outerjoin(ProjectAIContext, ProjectAIContext.project_id == Project.id)
            .where(Project.owner_user_id == owner_user_id, Project.archived_at.is_(None))
            .order_by(Project.updated_at.desc())
            .limit(limit)
        )
        return [
            ProjectAISummaryRecord(project=project, context=context)
            for project, context in result.all()
        ]

    async def collect_project_context(
        self,
        *,
        project_id: uuid.UUID,
        owner_user_id: uuid.UUID,
        notes_limit: int = 40,
        tasks_limit: int = 40,
        files_limit: int = 30,
    ) -> ProjectAIContextRecord | None:
        project_result = await self.session.execute(
            select(Project).where(Project.id == project_id, Project.owner_user_id == owner_user_id)
        )
        project = project_result.scalar_one_or_none()
        if project is None:
            return None

        context = await self.get_project_context(
            project_id=project_id,
            owner_user_id=owner_user_id,
        )

        notes_result = await self.session.execute(
            select(Note)
            .where(Note.project_id == project_id, Note.archived_at.is_(None))
            .order_by(Note.is_pinned.desc(), Note.updated_at.desc())
            .limit(notes_limit)
        )
        tasks_result = await self.session.execute(
            select(Task)
            .where(Task.project_id == project_id, Task.archived_at.is_(None))
            .order_by(Task.updated_at.desc())
            .limit(tasks_limit)
        )
        files_result = await self.session.execute(
            select(File)
            .where(File.project_id == project_id)
            .order_by(File.updated_at.desc())
            .limit(files_limit)
        )
        return ProjectAIContextRecord(
            project=project,
            context=context,
            notes=list(notes_result.scalars().all()),
            tasks=list(tasks_result.scalars().all()),
            files=list(files_result.scalars().all()),
        )

    async def upsert_project_context(
        self,
        *,
        owner_user_id: uuid.UUID,
        project_id: uuid.UUID,
        status: str,
        summary: str,
        source_counts: dict,
        tokens_estimate: int,
        last_rebuilt_at: datetime | None,
        marked_stale_at: datetime | None,
        error_message: str | None,
    ) -> ProjectAIContext:
        context = await self.get_project_context(
            project_id=project_id,
            owner_user_id=owner_user_id,
        )
        if context is None:
            context = ProjectAIContext(
                owner_user_id=owner_user_id,
                project_id=project_id,
            )
            self.session.add(context)

        context.status = status
        context.summary = summary
        context.source_counts = source_counts
        context.tokens_estimate = tokens_estimate
        context.last_rebuilt_at = last_rebuilt_at
        context.marked_stale_at = marked_stale_at
        context.error_message = error_message

        await self.session.commit()
        await self.session.refresh(context)
        return context
