import uuid
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.auth import UserRecord


def _to_user_record(user: User) -> UserRecord:
    return UserRecord(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        hashed_password=user.hashed_password,
        plan=user.plan,
        is_email_verified=user.is_email_verified,
        email_verification_code=user.email_verification_code,
        email_verification_expires_at=user.email_verification_expires_at,
        password_reset_code=user.password_reset_code,
        password_reset_expires_at=user.password_reset_expires_at,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@dataclass(slots=True, kw_only=True)
class UserRepository:
    session: AsyncSession

    async def get_by_id(self, user_id: uuid.UUID) -> UserRecord | None:
        user = await self.session.get(User, user_id)
        if user is None:
            return None
        return _to_user_record(user)

    async def get_by_email(self, email: str) -> UserRecord | None:
        result = await self.session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user is None:
            return None
        return _to_user_record(user)

    async def create(
        self,
        *,
        email: str,
        display_name: str,
        hashed_password: str,
        plan: str = "free",
        is_email_verified: bool = False,
        email_verification_code: str | None = None,
        email_verification_expires_at=None,
    ) -> UserRecord:
        user = User(
            email=email,
            display_name=display_name,
            hashed_password=hashed_password,
            plan=plan,
            is_email_verified=is_email_verified,
            email_verification_code=email_verification_code,
            email_verification_expires_at=email_verification_expires_at,
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return _to_user_record(user)

    async def update_profile(
        self,
        *,
        user_id: uuid.UUID,
        display_name: str | None,
        hashed_password: str | None,
    ) -> UserRecord | None:
        user = await self.session.get(User, user_id)
        if user is None:
            return None

        if display_name is not None:
            user.display_name = display_name
        if hashed_password is not None:
            user.hashed_password = hashed_password

        await self.session.commit()
        await self.session.refresh(user)
        return _to_user_record(user)

    async def set_email_verification_code(
        self,
        *,
        user_id: uuid.UUID,
        code: str,
        expires_at,
    ) -> UserRecord | None:
        user = await self.session.get(User, user_id)
        if user is None:
            return None

        user.email_verification_code = code
        user.email_verification_expires_at = expires_at
        await self.session.commit()
        await self.session.refresh(user)
        return _to_user_record(user)

    async def verify_email(self, *, user_id: uuid.UUID) -> UserRecord | None:
        user = await self.session.get(User, user_id)
        if user is None:
            return None

        user.is_email_verified = True
        user.email_verification_code = None
        user.email_verification_expires_at = None
        await self.session.commit()
        await self.session.refresh(user)
        return _to_user_record(user)

    async def set_password_reset_code(
        self,
        *,
        user_id: uuid.UUID,
        code: str,
        expires_at,
    ) -> UserRecord | None:
        user = await self.session.get(User, user_id)
        if user is None:
            return None

        user.password_reset_code = code
        user.password_reset_expires_at = expires_at
        await self.session.commit()
        await self.session.refresh(user)
        return _to_user_record(user)

    async def reset_password(
        self,
        *,
        user_id: uuid.UUID,
        hashed_password: str,
    ) -> UserRecord | None:
        user = await self.session.get(User, user_id)
        if user is None:
            return None

        user.hashed_password = hashed_password
        user.password_reset_code = None
        user.password_reset_expires_at = None
        await self.session.commit()
        await self.session.refresh(user)
        return _to_user_record(user)
