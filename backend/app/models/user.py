from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.mixins import WithTimestamps, WithUUID


class User(WithUUID, WithTimestamps, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    plan: Mapped[str] = mapped_column(String(20), nullable=False, default="free")
    is_email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    email_verification_code: Mapped[str | None] = mapped_column(String(6), nullable=True)
    email_verification_expires_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    password_reset_code: Mapped[str | None] = mapped_column(String(6), nullable=True)
    password_reset_expires_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
