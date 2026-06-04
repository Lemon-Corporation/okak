import uuid
from dataclasses import dataclass
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    display_name: str = Field(min_length=1, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=255)
    password: str | None = Field(default=None, min_length=8)


class AuthUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    display_name: str
    plan: str
    is_email_verified: bool
    created_at: datetime


class UserResponse(AuthUserResponse):
    updated_at: datetime


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserResponse


class RegisterInitResponse(BaseModel):
    email: EmailStr
    requires_email_verification: bool = True
    message: str


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8)


class MessageResponse(BaseModel):
    message: str


@dataclass(frozen=True, slots=True, kw_only=True)
class RegisterCommand:
    email: str
    password: str
    display_name: str


@dataclass(frozen=True, slots=True, kw_only=True)
class LoginCommand:
    email: str
    password: str


@dataclass(frozen=True, slots=True, kw_only=True)
class UpdateProfileCommand:
    display_name: str | None = None
    password: str | None = None


@dataclass(frozen=True, slots=True, kw_only=True)
class VerifyEmailCommand:
    email: str
    code: str


@dataclass(frozen=True, slots=True, kw_only=True)
class ResetPasswordCommand:
    email: str
    code: str
    new_password: str


@dataclass(frozen=True, slots=True, kw_only=True)
class UserRecord:
    id: uuid.UUID
    email: str
    display_name: str
    hashed_password: str
    plan: str
    is_email_verified: bool
    email_verification_code: str | None
    email_verification_expires_at: datetime | None
    password_reset_code: str | None
    password_reset_expires_at: datetime | None
    created_at: datetime
    updated_at: datetime


@dataclass(frozen=True, slots=True, kw_only=True)
class AuthResult:
    access_token: str
    user: UserRecord
