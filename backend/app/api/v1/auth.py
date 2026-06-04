from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.ioc.container import AppContainer
from app.presentation.dependencies import get_container, get_current_user
from app.schemas.auth import (
    AuthResponse,
    AuthUserResponse,
    ForgotPasswordRequest,
    LoginCommand,
    LoginRequest,
    MessageResponse,
    RegisterCommand,
    RegisterInitResponse,
    RegisterRequest,
    ResendVerificationRequest,
    ResetPasswordCommand,
    ResetPasswordRequest,
    UpdateProfileCommand,
    UpdateProfileRequest,
    UserRecord,
    UserResponse,
    VerifyEmailCommand,
    VerifyEmailRequest,
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


@router.post("/register", response_model=RegisterInitResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    _response: Response,
) -> RegisterInitResponse:
    await container.auth_service.register(
        RegisterCommand(
            email=body.email,
            password=body.password,
            display_name=body.display_name,
        )
    )
    return RegisterInitResponse(
        email=body.email,
        message="We sent a confirmation code to your email",
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


@router.post("/verify-email", response_model=AuthResponse)
async def verify_email(
    body: VerifyEmailRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    response: Response,
) -> AuthResponse:
    result = await container.auth_service.verify_email(
        VerifyEmailCommand(email=body.email, code=body.code)
    )
    _set_auth_cookie(response, result.access_token)
    return AuthResponse(
        access_token=result.access_token,
        user=AuthUserResponse.model_validate(result.user),
    )


@router.post("/resend-verification", response_model=MessageResponse)
async def resend_verification(
    body: ResendVerificationRequest,
    container: Annotated[AppContainer, Depends(get_container)],
) -> MessageResponse:
    await container.auth_service.resend_verification_code(body.email)
    return MessageResponse(message="Verification code sent")


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    body: ForgotPasswordRequest,
    container: Annotated[AppContainer, Depends(get_container)],
) -> MessageResponse:
    await container.auth_service.request_password_reset(body.email)
    return MessageResponse(message="If the account exists, we sent a reset code")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    body: ResetPasswordRequest,
    container: Annotated[AppContainer, Depends(get_container)],
) -> MessageResponse:
    await container.auth_service.reset_password(
        ResetPasswordCommand(
            email=body.email,
            code=body.code,
            new_password=body.new_password,
        )
    )
    return MessageResponse(message="Password updated")
