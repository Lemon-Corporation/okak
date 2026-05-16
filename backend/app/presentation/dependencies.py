from typing import Annotated

from fastapi import Cookie, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import Settings, get_settings
from app.core.database import get_db
from app.exceptions.base import UserAppError
from app.ioc.builders import build_container
from app.ioc.container import AppContainer
from app.schemas.auth import UserRecord

bearer_scheme = HTTPBearer(auto_error=False)


async def get_container(
    session: Annotated[AsyncSession, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> AppContainer:
    return build_container(settings=settings, session=session)


async def get_current_user(
    container: Annotated[AppContainer, Depends(get_container)],
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    access_token: Annotated[str | None, Cookie()] = None,
) -> UserRecord:
    token = access_token
    if token is None and credentials is not None and credentials.scheme.lower() == "bearer":
        token = credentials.credentials
    if token is None:
        raise UserAppError(code="token_invalid", message="Not authenticated")
    return await container.auth_service.get_current_user(token)
