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
    created_at: datetime


class UserResponse(AuthUserResponse):
    updated_at: datetime


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserResponse


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
class UserRecord:
    id: uuid.UUID
    email: str
    display_name: str
    hashed_password: str
    created_at: datetime
    updated_at: datetime


@dataclass(frozen=True, slots=True, kw_only=True)
class AuthResult:
    access_token: str
    user: UserRecord
