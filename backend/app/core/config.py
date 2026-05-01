from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "ОКАК API"
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/okak"
    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    cors_origins: list[str] = ["http://localhost:3000"]

    llm_provider: str = "openai"  # openai | qwen
    openai_api_key: str = ""
    qwen_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
