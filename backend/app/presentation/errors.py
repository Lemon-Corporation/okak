from fastapi import Request, status
from fastapi.responses import JSONResponse

from app.exceptions.base import AppError

ERROR_STATUS_BY_CODE = {
    "email_taken": status.HTTP_409_CONFLICT,
    "invalid_credentials": status.HTTP_401_UNAUTHORIZED,
    "token_expired": status.HTTP_401_UNAUTHORIZED,
    "token_invalid": status.HTTP_401_UNAUTHORIZED,
    "not_found": status.HTTP_404_NOT_FOUND,
    "forbidden": status.HTTP_403_FORBIDDEN,
    "already_exists": status.HTTP_409_CONFLICT,
    "file_too_large": status.HTTP_400_BAD_REQUEST,
    "invalid_mime_type": status.HTTP_400_BAD_REQUEST,
    "file_not_on_disk": status.HTTP_500_INTERNAL_SERVER_ERROR,
    "query_too_short": status.HTTP_400_BAD_REQUEST,
}


async def app_error_handler(_request: Request, error: AppError) -> JSONResponse:
    status_code = ERROR_STATUS_BY_CODE.get(
        error.code,
        status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
    return JSONResponse(
        status_code=status_code,
        content={"detail": error.message, "code": error.code},
    )
