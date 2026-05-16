from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.ioc.container import AppContainer
from app.presentation.dependencies import get_container, get_current_user
from app.schemas.auth import (
    AuthResponse,
    AuthUserResponse,
    LoginCommand,
    LoginRequest,
    RegisterCommand,
    RegisterRequest,
    UpdateProfileCommand,
    UpdateProfileRequest,
    UserRecord,
    UserResponse,
)

router = APIRouter()


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=60 * 60 * 24 * 7,
        samesite="lax",
        secure=False,
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    response: Response,
) -> AuthResponse:
    result = await container.auth_service.register(
        RegisterCommand(
            email=body.email,
            password=body.password,
            display_name=body.display_name,
        )
    )
    _set_auth_cookie(response, result.access_token)
    return AuthResponse(
        access_token=result.access_token,
        user=AuthUserResponse.model_validate(result.user),
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    body: LoginRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    response: Response,
) -> AuthResponse:
    result = await container.auth_service.login(
        LoginCommand(email=body.email, password=body.password)
    )
    _set_auth_cookie(response, result.access_token)
    return AuthResponse(
        access_token=result.access_token,
        user=AuthUserResponse.model_validate(result.user),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> None:
    response.delete_cookie(key="access_token", httponly=True, samesite="lax", secure=False)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: Annotated[UserRecord, Depends(get_current_user)]) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_me(
    body: UpdateProfileRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> UserResponse:
    user = await container.auth_service.update_profile(
        user_id=current_user.id,
        command=UpdateProfileCommand(
            display_name=body.display_name,
            password=body.password,
        ),
    )
    return UserResponse.model_validate(user)
