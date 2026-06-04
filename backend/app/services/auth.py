import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import secrets

from app.config.settings import AuthSettings
from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.exceptions.base import UserAppError
from app.repository.users import UserRepository
from app.schemas.auth import (
    AuthResult,
    LoginCommand,
    RegisterCommand,
    ResetPasswordCommand,
    UpdateProfileCommand,
    UserRecord,
    VerifyEmailCommand,
)
from app.services.email import EmailService


@dataclass(slots=True, kw_only=True)
class AuthService:
    user_repository: UserRepository
    settings: AuthSettings
    email_service: EmailService

    async def register(self, command: RegisterCommand) -> None:
        existing_user = await self.user_repository.get_by_email(command.email)
        if existing_user is not None:
            raise UserAppError(code="email_taken", message="Email already registered")

        code = self._generate_code()
        expires_at = self._code_expiry(self.settings.verification_code_ttl_minutes)
        user = await self.user_repository.create(
            email=command.email,
            display_name=command.display_name,
            hashed_password=hash_password(command.password),
            is_email_verified=False,
            email_verification_code=code,
            email_verification_expires_at=expires_at,
        )
        await self.email_service.send_verification_code(
            to_email=user.email,
            display_name=user.display_name,
            code=code,
            ttl_minutes=self.settings.verification_code_ttl_minutes,
        )

    async def login(self, command: LoginCommand) -> AuthResult:
        user = await self.user_repository.get_by_email(command.email)
        if user is None or not verify_password(command.password, user.hashed_password):
            raise UserAppError(code="invalid_credentials", message="Invalid credentials")
        if not user.is_email_verified:
            raise UserAppError(code="email_not_verified", message="Confirm your email to continue")

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

    async def verify_email(self, command: VerifyEmailCommand) -> AuthResult:
        user = await self.user_repository.get_by_email(command.email)
        if user is None:
            raise UserAppError(code="not_found", message="User not found")
        if user.is_email_verified:
            return self._build_auth_result(user)
        if user.email_verification_code != command.code:
            raise UserAppError(code="invalid_verification_code", message="Verification code is invalid")
        if user.email_verification_expires_at is None or user.email_verification_expires_at < datetime.now(timezone.utc):
            raise UserAppError(code="verification_code_expired", message="Verification code expired")

        verified_user = await self.user_repository.verify_email(user_id=user.id)
        if verified_user is None:
            raise UserAppError(code="not_found", message="User not found")
        return self._build_auth_result(verified_user)

    async def resend_verification_code(self, email: str) -> None:
        user = await self.user_repository.get_by_email(email)
        if user is None:
            raise UserAppError(code="not_found", message="User not found")
        if user.is_email_verified:
            raise UserAppError(code="email_already_verified", message="Email already verified")

        code = self._generate_code()
        expires_at = self._code_expiry(self.settings.verification_code_ttl_minutes)
        updated_user = await self.user_repository.set_email_verification_code(
            user_id=user.id,
            code=code,
            expires_at=expires_at,
        )
        if updated_user is None:
            raise UserAppError(code="not_found", message="User not found")

        await self.email_service.send_verification_code(
            to_email=updated_user.email,
            display_name=updated_user.display_name,
            code=code,
            ttl_minutes=self.settings.verification_code_ttl_minutes,
        )

    async def request_password_reset(self, email: str) -> None:
        user = await self.user_repository.get_by_email(email)
        if user is None:
            return

        code = self._generate_code()
        expires_at = self._code_expiry(self.settings.password_reset_code_ttl_minutes)
        updated_user = await self.user_repository.set_password_reset_code(
            user_id=user.id,
            code=code,
            expires_at=expires_at,
        )
        if updated_user is None:
            return

        await self.email_service.send_password_reset_code(
            to_email=updated_user.email,
            code=code,
            ttl_minutes=self.settings.password_reset_code_ttl_minutes,
        )

    async def reset_password(self, command: ResetPasswordCommand) -> None:
        user = await self.user_repository.get_by_email(command.email)
        if user is None:
            raise UserAppError(code="not_found", message="User not found")
        if user.password_reset_code != command.code:
            raise UserAppError(code="invalid_reset_code", message="Reset code is invalid")
        if user.password_reset_expires_at is None or user.password_reset_expires_at < datetime.now(timezone.utc):
            raise UserAppError(code="reset_code_expired", message="Reset code expired")

        updated_user = await self.user_repository.reset_password(
            user_id=user.id,
            hashed_password=hash_password(command.new_password),
        )
        if updated_user is None:
            raise UserAppError(code="not_found", message="User not found")

    def _build_auth_result(self, user: UserRecord) -> AuthResult:
        token = create_access_token(str(user.id), self.settings)
        return AuthResult(access_token=token, user=user)

    def _generate_code(self) -> str:
        return "".join(secrets.choice("0123456789") for _ in range(6))

    def _code_expiry(self, ttl_minutes: int) -> datetime:
        return datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)
