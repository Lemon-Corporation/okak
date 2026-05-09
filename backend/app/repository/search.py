import re
import uuid
from dataclasses import dataclass

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.enums import SearchKind
from app.schemas.search import (
    SearchNoteResult,
    SearchProjectResult,
    SearchResponse,
    SearchTaskResult,
)

SPECIAL_CHARS_PATTERN = re.compile(r"[^\w\sа-яА-ЯёЁ-]+")


@dataclass(slots=True, kw_only=True)
class SearchRepository:
    session: AsyncSession

    async def search(
        self,
        *,
        owner_user_id: uuid.UUID,
        query: str,
        kind: SearchKind | None,
        limit: int,
    ) -> SearchResponse:
        normalized_query = self.normalize_query(query)
        notes = []
        tasks = []
        projects = []

        if kind in (None, SearchKind.NOTE):
            notes = await self._search_notes(owner_user_id, normalized_query, limit)
        if kind in (None, SearchKind.TASK):
            tasks = await self._search_tasks(owner_user_id, normalized_query, limit)
        if kind in (None, SearchKind.PROJECT):
            projects = await self._search_projects(owner_user_id, normalized_query, limit)

        return SearchResponse(notes=notes, tasks=tasks, projects=projects)

    def normalize_query(self, query: str) -> str:
        return SPECIAL_CHARS_PATTERN.sub(" ", query).strip()

    async def _search_notes(
        self,
        owner_user_id: uuid.UUID,
        query: str,
        limit: int,
    ) -> list[SearchNoteResult]:
        result = await self.session.execute(
            text(
                """
                WITH query AS (SELECT plainto_tsquery('russian', :query) AS value)
                SELECT
                    notes.id,
                    notes.project_id,
                    notes.title,
                    ts_headline(
                        'russian',
                        coalesce(notes.content, ''),
                        query.value,
                        'MaxWords=15,MinWords=5'
                    ) AS content_excerpt,
                    notes.status,
                    notes.updated_at,
                    ts_rank(
                        to_tsvector(
                            'russian',
                            notes.title || ' ' || coalesce(notes.content, '')
                        ),
                        query.value
                    ) AS rank
                FROM notes
                JOIN projects ON notes.project_id = projects.id
                CROSS JOIN query
                WHERE projects.owner_user_id = :owner_user_id
                  AND notes.archived_at IS NULL
                  AND to_tsvector(
                      'russian',
                      notes.title || ' ' || coalesce(notes.content, '')
                  ) @@ query.value
                ORDER BY rank DESC
                LIMIT :limit
                """
            ),
            {"owner_user_id": owner_user_id, "query": query, "limit": limit},
        )
        return [SearchNoteResult.model_validate(dict(row._mapping)) for row in result]

    async def _search_tasks(
        self,
        owner_user_id: uuid.UUID,
        query: str,
        limit: int,
    ) -> list[SearchTaskResult]:
        result = await self.session.execute(
            text(
                """
                WITH query AS (SELECT plainto_tsquery('russian', :query) AS value)
                SELECT
                    tasks.id,
                    tasks.project_id,
                    tasks.title,
                    tasks.status,
                    tasks.priority,
                    tasks.updated_at,
                    ts_rank(
                        to_tsvector(
                            'russian',
                            tasks.title || ' ' || coalesce(tasks.description, '')
                        ),
                        query.value
                    ) AS rank
                FROM tasks
                JOIN projects ON tasks.project_id = projects.id
                CROSS JOIN query
                WHERE projects.owner_user_id = :owner_user_id
                  AND tasks.archived_at IS NULL
                  AND to_tsvector(
                      'russian',
                      tasks.title || ' ' || coalesce(tasks.description, '')
                  ) @@ query.value
                ORDER BY rank DESC
                LIMIT :limit
                """
            ),
            {"owner_user_id": owner_user_id, "query": query, "limit": limit},
        )
        return [SearchTaskResult.model_validate(dict(row._mapping)) for row in result]

    async def _search_projects(
        self,
        owner_user_id: uuid.UUID,
        query: str,
        limit: int,
    ) -> list[SearchProjectResult]:
        result = await self.session.execute(
            text(
                """
                WITH query AS (SELECT plainto_tsquery('russian', :query) AS value)
                SELECT
                    projects.id,
                    projects.kind,
                    projects.title,
                    projects.status,
                    projects.updated_at,
                    ts_rank(
                        to_tsvector(
                            'russian',
                            projects.title || ' ' || coalesce(projects.description, '')
                        ),
                        query.value
                    ) AS rank
                FROM projects
                CROSS JOIN query
                WHERE projects.owner_user_id = :owner_user_id
                  AND projects.archived_at IS NULL
                  AND to_tsvector(
                      'russian',
                      projects.title || ' ' || coalesce(projects.description, '')
                  ) @@ query.value
                ORDER BY rank DESC
                LIMIT :limit
                """
            ),
            {"owner_user_id": owner_user_id, "query": query, "limit": limit},
        )
        return [SearchProjectResult.model_validate(dict(row._mapping)) for row in result]
