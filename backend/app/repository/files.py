import asyncio
import uuid
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from sqlalchemy import Select, delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import UploadSettings
from app.models.file import File, NoteFile, ProjectFile, TaskFile
from app.models.project import Project
from app.schemas.enums import FileSource


@dataclass(slots=True, kw_only=True)
class FileStorageRepository:
    settings: UploadSettings

    async def save(self, *, original_name: str, content: bytes) -> str:
        storage_key = self.build_storage_key(original_name)
        path = self.resolve_path(storage_key)
        await asyncio.to_thread(self._write_bytes, path, content)
        return storage_key

    async def delete(self, storage_key: str) -> None:
        path = self.resolve_path(storage_key)
        await asyncio.to_thread(self._delete_file, path)

    def exists(self, storage_key: str) -> bool:
        return self.resolve_path(storage_key).is_file()

    def resolve_path(self, storage_key: str) -> Path:
        return self.settings.uploads_dir / storage_key

    def build_storage_key(self, original_name: str) -> str:
        now = datetime.now()
        suffix = Path(original_name).suffix.lower()
        filename = f"{uuid.uuid4().hex}{suffix}"
        return f"{now:%Y}/{now:%m}/{filename}"

    def _write_bytes(self, path: Path, content: bytes) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)

    def _delete_file(self, path: Path) -> None:
        if path.exists():
            path.unlink()


@dataclass(slots=True, kw_only=True)
class FileRepository:
    session: AsyncSession

    async def get_owned(self, *, file_id: uuid.UUID, owner_user_id: uuid.UUID) -> File | None:
        result = await self.session.execute(
            select(File)
            .join(Project, File.project_id == Project.id)
            .where(File.id == file_id, Project.owner_user_id == owner_user_id)
        )
        return result.scalar_one_or_none()

    async def find_duplicate(
        self,
        *,
        project_id: uuid.UUID,
        checksum_sha256: str,
    ) -> File | None:
        result = await self.session.execute(
            select(File).where(
                File.project_id == project_id,
                File.checksum_sha256 == checksum_sha256,
            )
        )
        return result.scalar_one_or_none()

    async def create_upload(
        self,
        *,
        project_id: uuid.UUID,
        original_name: str,
        storage_key: str,
        mime_type: str | None,
        extension: str | None,
        size_bytes: int,
        checksum_sha256: str,
    ) -> File:
        file = File(
            project_id=project_id,
            original_name=original_name,
            storage_key=storage_key,
            mime_type=mime_type,
            extension=extension,
            size_bytes=size_bytes,
            checksum_sha256=checksum_sha256,
            source=FileSource.UPLOAD,
        )
        self.session.add(file)
        await self.session.flush()
        self.session.add(ProjectFile(project_id=project_id, file_id=file.id))
        await self.session.commit()
        await self.session.refresh(file)
        return file

    async def list_project_files(
        self,
        *,
        project_id: uuid.UUID,
        limit: int,
        offset: int,
    ) -> tuple[list[File], int]:
        query = (
            select(File)
            .join(ProjectFile, ProjectFile.file_id == File.id)
            .where(ProjectFile.project_id == project_id)
        )
        total = await self._count(query)
        result = await self.session.execute(
            query.order_by(File.created_at.desc()).limit(limit).offset(offset)
        )
        return list(result.scalars().all()), total

    async def attach_project_file(
        self,
        *,
        project_id: uuid.UUID,
        file_id: uuid.UUID,
    ) -> ProjectFile | None:
        link = ProjectFile(project_id=project_id, file_id=file_id)
        self.session.add(link)
        try:
            await self.session.commit()
        except IntegrityError:
            await self.session.rollback()
            return None
        await self.session.refresh(link)
        return link

    async def detach_project_file(self, *, project_id: uuid.UUID, file_id: uuid.UUID) -> None:
        await self.session.execute(
            delete(ProjectFile).where(
                ProjectFile.project_id == project_id,
                ProjectFile.file_id == file_id,
            )
        )
        await self.session.commit()

    async def delete_file_record(self, file: File) -> None:
        await self.session.execute(delete(ProjectFile).where(ProjectFile.file_id == file.id))
        await self.session.execute(delete(NoteFile).where(NoteFile.file_id == file.id))
        await self.session.execute(delete(TaskFile).where(TaskFile.file_id == file.id))
        await self.session.delete(file)
        await self.session.commit()

    async def _count(self, query: Select[tuple[File]]) -> int:
        result = await self.session.execute(select(func.count()).select_from(query.subquery()))
        return int(result.scalar_one())
