import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, Response, UploadFile, status
from fastapi.responses import FileResponse as FastAPIFileResponse

from app.ioc.container import AppContainer
from app.presentation.dependencies import get_container, get_current_user
from app.schemas.auth import UserRecord
from app.schemas.files import FileResponse, UploadFileCommand

router = APIRouter()


@router.post("/upload", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
    project_id: Annotated[uuid.UUID, Form()],
    file: Annotated[UploadFile, File()],
) -> FileResponse:
    content = await file.read()
    return await container.file_service.upload_file(
        owner_user_id=current_user.id,
        command=UploadFileCommand(
            project_id=project_id,
            original_name=file.filename or "upload",
            mime_type=file.content_type,
            content=content,
        ),
    )


@router.get("/{file_id}", response_model=FileResponse)
async def get_file(
    file_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> FileResponse:
    return await container.file_service.get_file(file_id=file_id, owner_user_id=current_user.id)


@router.get("/{file_id}/download")
async def download_file(
    file_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> FastAPIFileResponse:
    download = await container.file_service.download_file(
        file_id=file_id,
        owner_user_id=current_user.id,
    )
    return FastAPIFileResponse(
        path=download.path,
        media_type=download.mime_type,
        filename=download.original_name,
        headers={"Content-Length": str(download.size_bytes)},
    )


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: uuid.UUID,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> Response:
    await container.file_service.delete_file(file_id=file_id, owner_user_id=current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
