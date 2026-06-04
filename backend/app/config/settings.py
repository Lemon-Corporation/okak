from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppSettings(BaseModel):
    name: str = "ОКАК API"
    version: str = "0.1.0"
    cors_origins: list[str] = Field(default_factory=list) # MUST BE SET IN PRODUCTION


class PostgresSettings(BaseModel):
    host: str = "localhost"
    port: int = 5432
    user: str = "postgres"
    password: str = "" # Set via environment variable
    database: str = "okak"
    echo: bool = False

    @property
    def dsn(self) -> str:
        return (
            f"postgresql+asyncpg://{self.user}:{self.password}"
            f"@{self.host}:{self.port}/{self.database}"
        )


class AuthSettings(BaseModel):
    secret_key: str = Field(..., description="MUST BE SET IN PRODUCTION")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    verification_code_ttl_minutes: int = 15
    password_reset_code_ttl_minutes: int = 15


class EmailSettings(BaseModel):
    enabled: bool = False
    host: str = "smtp.mail.ru"
    port: int = 465
    username: str = ""
    password: str = ""
    from_email: str = ""
    from_name: str = "ОКАК"
    use_ssl: bool = True
    use_starttls: bool = False


class UploadSettings(BaseModel):
    uploads_dir: Path = Path("./uploads")
    max_file_size_mb: int = 50
    allowed_mime_types: list[str] = Field(
        default_factory=lambda: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml",
            "application/pdf",
            "text/plain",
            "text/markdown",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/zip",
        ]
    )

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024


class LLMSettings(BaseModel):
    provider: str = "gigachat"
    openai_api_key: str = ""
    qwen_api_key: str = ""
    gigachat_auth_key: str = ""
    gigachat_scope: str = "GIGACHAT_API_B2B"
    gigachat_model: str = "GigaChat-2-Max"
    gigachat_base_url: str = "https://gigachat.devices.sberbank.ru/api/v1"
    gigachat_auth_url: str = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
    gigachat_image_model: str = "GigaChat-2-Pro"
    gigachat_verify_ssl_certs: bool = True
    request_timeout_seconds: float = 60.0


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="OKAK_",
        env_nested_delimiter="__",
        extra="ignore",
    )

    app: AppSettings = Field(default_factory=AppSettings)
    postgres: PostgresSettings = Field(default_factory=PostgresSettings)
    auth: AuthSettings = Field(default_factory=AuthSettings)
    email: EmailSettings = Field(default_factory=EmailSettings)
    uploads: UploadSettings = Field(default_factory=UploadSettings)
    llm: LLMSettings = Field(default_factory=LLMSettings)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
