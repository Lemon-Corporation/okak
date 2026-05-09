from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.ioc.container import AppContainer
from app.presentation.dependencies import get_container, get_current_user
from app.schemas.auth import UserRecord
from app.schemas.enums import SearchKind
from app.schemas.search import SearchResponse

router = APIRouter()


@router.get("", response_model=SearchResponse)
async def search(
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
    q: Annotated[str, Query()],
    kind: SearchKind | None = None,
    limit: int = 10,
) -> SearchResponse:
    return await container.search_service.search(
        owner_user_id=current_user.id,
        query=q,
        kind=kind,
        limit=limit,
    )
