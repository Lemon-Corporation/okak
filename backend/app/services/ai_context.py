import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

from app.exceptions.base import UserAppError
from app.models.ai_context import ProjectAIContext
from app.repository.ai_context import AIContextRepository, ProjectAIContextRecord
from app.schemas.ai import (
    ProjectAIContextPreviewResponse,
    ProjectAIContextRebuildResponse,
    ProjectAIContextStatusResponse,
)
from app.services.llm import LLMClient


@dataclass(slots=True, kw_only=True)
class AIContextService:
    ai_context_repository: AIContextRepository
    llm_client: LLMClient

    async def get_status(
        self,
        *,
        project_id: uuid.UUID,
        owner_user_id: uuid.UUID,
    ) -> ProjectAIContextStatusResponse:
        record = await self.ai_context_repository.collect_project_context(
            project_id=project_id,
            owner_user_id=owner_user_id,
            notes_limit=0,
            tasks_limit=0,
            files_limit=0,
        )
        if record is None:
            raise UserAppError(code="not_found", message="Project not found")
        return self._build_status_response(project_id=project_id, context=record.context)

    async def get_preview(
        self,
        *,
        project_id: uuid.UUID,
        owner_user_id: uuid.UUID,
    ) -> ProjectAIContextPreviewResponse:
        record = await self.ai_context_repository.collect_project_context(
            project_id=project_id,
            owner_user_id=owner_user_id,
            notes_limit=0,
            tasks_limit=0,
            files_limit=0,
        )
        if record is None:
            raise UserAppError(code="not_found", message="Project not found")
        status = self._build_status_response(project_id=project_id, context=record.context)
        return ProjectAIContextPreviewResponse(
            **status.model_dump(),
            project_title=record.project.title,
            project_description=record.project.description,
        )

    async def rebuild_project_context(
        self,
        *,
        project_id: uuid.UUID,
        owner_user_id: uuid.UUID,
    ) -> ProjectAIContextRebuildResponse:
        record = await self.ai_context_repository.collect_project_context(
            project_id=project_id,
            owner_user_id=owner_user_id,
        )
        if record is None:
            raise UserAppError(code="not_found", message="Project not found")

        summary_input = self._format_project_context(record, max_chars=14_000)
        fallback_summary = self._build_fallback_summary(record)
        error_message = None
        summary = fallback_summary

        if self.llm_client.is_configured():
            try:
                response = await self.llm_client.chat(
                    [
                        {
                            "role": "system",
                            "content": (
                                "You create compact project memory for a main workspace agent. "
                                "Summarize durable facts, goals, decisions, active risks, and next steps. "
                                "Keep it concise and answer in the language of the source content."
                            ),
                        },
                        {"role": "user", "content": summary_input},
                    ],
                    temperature=0.1,
                    max_tokens=700,
                )
                llm_summary = (response.get("content") or "").strip()
                if llm_summary:
                    summary = llm_summary
            except Exception as error:
                error_message = str(error)[:1000]

        now = datetime.now(timezone.utc)
        source_counts = self._source_counts(record)
        context = await self.ai_context_repository.upsert_project_context(
            owner_user_id=owner_user_id,
            project_id=project_id,
            status="ready",
            summary=summary,
            source_counts=source_counts,
            tokens_estimate=self._estimate_tokens(summary_input),
            last_rebuilt_at=now,
            marked_stale_at=None,
            error_message=error_message,
        )
        return ProjectAIContextRebuildResponse(
            **self._build_status_response(project_id=project_id, context=context).model_dump()
        )

    def _build_status_response(
        self,
        *,
        project_id: uuid.UUID,
        context: ProjectAIContext | None,
    ) -> ProjectAIContextStatusResponse:
        if context is None:
            return ProjectAIContextStatusResponse(
                project_id=project_id,
                status="stale",
                is_stale=True,
                summary=None,
            )
        return ProjectAIContextStatusResponse(
            project_id=project_id,
            status=context.status,
            is_stale=context.status != "ready",
            summary=context.summary,
            source_counts=context.source_counts,
            tokens_estimate=context.tokens_estimate,
            last_rebuilt_at=context.last_rebuilt_at,
            marked_stale_at=context.marked_stale_at,
            error_message=context.error_message,
        )

    def _build_fallback_summary(self, record: ProjectAIContextRecord) -> str:
        parts = [
            f"Project: {record.project.title}",
            f"Description: {record.project.description or 'No description'}",
            (
                "Counts: "
                f"{len(record.notes)} notes, {len(record.tasks)} tasks, {len(record.files)} files"
            ),
        ]
        if record.notes:
            parts.append("Recent notes: " + "; ".join(note.title for note in record.notes[:5]))
        if record.tasks:
            parts.append("Recent tasks: " + "; ".join(task.title for task in record.tasks[:5]))
        return "\n".join(parts)

    def _format_project_context(self, record: ProjectAIContextRecord, *, max_chars: int) -> str:
        chunks = [
            f"PROJECT\nTitle: {record.project.title}\nDescription: {record.project.description}\nStatus: {record.project.status.value}",
            "NOTES",
        ]
        for note in record.notes:
            chunks.append(
                f"- [{note.status.value}] {note.title}\n"
                f"  Updated: {note.updated_at.isoformat()}\n"
                f"  Content: {self._trim(note.content, 1200)}"
            )
        chunks.append("TASKS")
        for task in record.tasks:
            chunks.append(
                f"- [{task.status.value}/{task.priority.value}] {task.title}\n"
                f"  Updated: {task.updated_at.isoformat()}\n"
                f"  Description: {self._trim(task.description, 800)}"
            )
        chunks.append("FILES")
        for file in record.files:
            chunks.append(
                f"- {file.original_name} ({file.mime_type or 'unknown'}, {file.size_bytes} bytes)"
            )
        return self._trim("\n\n".join(chunks), max_chars)

    def _source_counts(self, record: ProjectAIContextRecord) -> dict[str, int]:
        return {
            "notes": len(record.notes),
            "tasks": len(record.tasks),
            "files": len(record.files),
        }

    def _estimate_tokens(self, text: str) -> int:
        return max(1, len(text) // 4)

    def _trim(self, value: str, max_chars: int) -> str:
        if len(value) <= max_chars:
            return value
        return value[: max_chars - 3].rstrip() + "..."
