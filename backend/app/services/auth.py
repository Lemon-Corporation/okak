import uuid
from dataclasses import dataclass

from app.config.settings import AuthSettings
from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.exceptions.base import UserAppError
from app.repository.users import UserRepository
from app.schemas.auth import AuthResult, LoginCommand, RegisterCommand, UpdateProfileCommand, UserRecord


@dataclass(slots=True, kw_only=True)
class AuthService:
    user_repository: UserRepository
    settings: AuthSettings

    async def register(self, command: RegisterCommand) -> AuthResult:
        existing_user = await self.user_repository.get_by_email(command.email)
        if existing_user is not None:
            raise UserAppError(code="email_taken", message="Email already registered")

        user = await self.user_repository.create(
            email=command.email,
            display_name=command.display_name,
            hashed_password=hash_password(command.password),
        )
        return self._build_auth_result(user)

    async def login(self, command: LoginCommand) -> AuthResult:
        user = await self.user_repository.get_by_email(command.email)
        if user is None or not verify_password(command.password, user.hashed_password):
            raise UserAppError(code="invalid_credentials", message="Invalid credentials")

        return self._build_auth_result(user)

    async def get_current_user(self, token: str) -> UserRecord:
        subject = decode_access_token(token, self.settings)
        try:
            user_id = uuid.UUID(subject)
        except ValueError as error:
            raise UserAppError(code="token_invalid", message="Token invalid") from error

        user = await self.user_repository.get_by_id(user_id)
        if user is None:
            raise UserAppError(code="token_invalid", message="Token invalid")
        return user

    async def update_profile(
        self,
        *,
        user_id: uuid.UUID,
        command: UpdateProfileCommand,
    ) -> UserRecord:
        hashed_password = hash_password(command.password) if command.password is not None else None
        user = await self.user_repository.update_profile(
            user_id=user_id,
            display_name=command.display_name,
            hashed_password=hashed_password,
        )
        if user is None:
            raise UserAppError(code="not_found", message="User not found")
        return user

    def _build_auth_result(self, user: UserRecord) -> AuthResult:
        token = create_access_token(str(user.id), self.settings)
        return AuthResult(access_token=token, user=user)
