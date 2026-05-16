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

    async def create(self, *, email: str, display_name: str, hashed_password: str, plan: str = "free") -> UserRecord:
        user = User(
            email=email,
            display_name=display_name,
            hashed_password=hashed_password,
            plan=plan,
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
