from datetime import datetime, timedelta, timezone

from jose import ExpiredSignatureError, JWTError, jwt
from passlib.context import CryptContext

from app.config.settings import AuthSettings
from app.exceptions.base import UserAppError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str, settings: AuthSettings) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str, settings: AuthSettings) -> str:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except ExpiredSignatureError as error:
        raise UserAppError(code="token_expired", message="Token expired") from error
    except JWTError as error:
        raise UserAppError(code="token_invalid", message="Token invalid") from error

    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject:
        raise UserAppError(code="token_invalid", message="Token invalid")
    return subject
