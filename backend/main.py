from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.exceptions.base import AppError
from app.core.config import settings
from app.api.v1 import router as api_router
from app.presentation.errors import app_error_handler

app = FastAPI(title=settings.app.name, version=settings.app.version)
app.add_exception_handler(AppError, app_error_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.app.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
