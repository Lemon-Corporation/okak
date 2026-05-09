import uuid
from dataclasses import dataclass

from app.exceptions.base import UserAppError
from app.repository.search import SearchRepository
from app.schemas.enums import SearchKind
from app.schemas.search import SearchResponse


@dataclass(slots=True, kw_only=True)
class SearchService:
    search_repository: SearchRepository

    async def search(
        self,
        *,
        owner_user_id: uuid.UUID,
        query: str,
        kind: SearchKind | None,
        limit: int,
    ) -> SearchResponse:
        normalized_query = self.search_repository.normalize_query(query)
        if len(normalized_query) < 2:
            raise UserAppError(code="query_too_short", message="Search query is too short")
        return await self.search_repository.search(
            owner_user_id=owner_user_id,
            query=normalized_query,
            kind=kind,
            limit=limit,
        )
