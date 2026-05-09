import hashlib
import uuid
from dataclasses import dataclass
from pathlib import Path

from app.config.settings import UploadSettings
from app.exceptions.base import ServerAppError, UserAppError
from app.models.project import Project
from app.repository.files import FileRepository, FileStorageRepository
from app.repository.projects import ProjectRepository
from app.schemas.files import FileDownload, FileResponse, UploadFileCommand


@dataclass(slots=True, kw_only=True)
class FileService:
    file_repository: FileRepository
    storage_repository: FileStorageRepository
    project_repository: ProjectRepository
    settings: UploadSettings

    async def upload_file(
        self,
        *,
        owner_user_id: uuid.UUID,
        command: UploadFileCommand,
    ) -> FileResponse:
        await self._ensure_project_owned(command.project_id, owner_user_id)
        self._validate_file(command)

        checksum = hashlib.sha256(command.content).hexdigest()
        duplicate = await self.file_repository.find_duplicate(
            project_id=command.project_id,
            checksum_sha256=checksum,
        )
        if duplicate is not None:
            return FileResponse.model_validate(duplicate)

        storage_key = await self.storage_repository.save(
            original_name=command.original_name,
            content=command.content,
        )
        try:
            file = await self.file_repository.create_upload(
                project_id=command.project_id,
                original_name=command.original_name,
                storage_key=storage_key,
                mime_type=command.mime_type,
                extension=self._extract_extension(command.original_name),
                size_bytes=len(command.content),
                checksum_sha256=checksum,
            )
        except Exception:
            await self.storage_repository.delete(storage_key)
            raise
        return FileResponse.model_validate(file)

    async def get_file(self, *, file_id: uuid.UUID, owner_user_id: uuid.UUID) -> FileResponse:
        file = await self.file_repository.get_owned(file_id=file_id, owner_user_id=owner_user_id)
        if file is None:
            raise UserAppError(code="not_found", message="File not found")
        return FileResponse.model_validate(file)

    async def download_file(
        self,
        *,
        file_id: uuid.UUID,
        owner_user_id: uuid.UUID,
    ) -> FileDownload:
        file = await self.file_repository.get_owned(file_id=file_id, owner_user_id=owner_user_id)
        if file is None:
            raise UserAppError(code="not_found", message="File not found")
        if not self.storage_repository.exists(file.storage_key):
            raise ServerAppError(code="file_not_on_disk", message="File not found on disk")

        return FileDownload(
            path=self.storage_repository.resolve_path(file.storage_key),
            original_name=file.original_name,
            mime_type=file.mime_type,
            size_bytes=file.size_bytes,
        )

    async def delete_file(self, *, file_id: uuid.UUID, owner_user_id: uuid.UUID) -> None:
        file = await self.file_repository.get_owned(file_id=file_id, owner_user_id=owner_user_id)
        if file is None:
            raise UserAppError(code="not_found", message="File not found")
        await self.storage_repository.delete(file.storage_key)
        await self.file_repository.delete_file_record(file)

    async def _ensure_project_owned(
        self,
        project_id: uuid.UUID,
        owner_user_id: uuid.UUID,
    ) -> Project:
        project = await self.project_repository.get(project_id)
        if project is None:
            raise UserAppError(code="not_found", message="Project not found")
        if project.owner_user_id != owner_user_id:
            raise UserAppError(code="forbidden", message="Access denied")
        return project

    def _validate_file(self, command: UploadFileCommand) -> None:
        if len(command.content) > self.settings.max_file_size_bytes:
            raise UserAppError(
                code="file_too_large",
                message=f"File exceeds {self.settings.max_file_size_mb} MB limit",
            )
        if command.mime_type not in self.settings.allowed_mime_types:
            raise UserAppError(code="invalid_mime_type", message="File type is not allowed")

    def _extract_extension(self, original_name: str) -> str | None:
        suffix = Path(original_name).suffix.lower().lstrip(".")
        return suffix or None
