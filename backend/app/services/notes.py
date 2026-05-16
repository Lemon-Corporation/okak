import uuid
from dataclasses import dataclass
from datetime import datetime, timezone

from app.exceptions.base import UserAppError
from app.models.file import File
from app.models.note import Note
from app.models.project import Project
from app.models.tag import Tag
from app.repository.files import FileRepository
from app.repository.notes import NoteRepository
from app.repository.projects import ProjectRepository
from app.repository.tags import TagRepository
from app.schemas.enums import NoteStatus
from app.schemas.files import FileBriefResponse, NoteFileLinkResponse
from app.schemas.notes import (
    CreateNoteCommand,
    NoteFilters,
    NoteFullResponse,
    NoteResponse,
    PaginatedNotesResponse,
    UpdateNoteCommand,
)
from app.schemas.tags import NoteTagLinkResponse, TagResponse


@dataclass(slots=True, kw_only=True)
class NoteService:
    note_repository: NoteRepository
    project_repository: ProjectRepository
    tag_repository: TagRepository
    file_repository: FileRepository

    async def list_notes(self, filters: NoteFilters) -> PaginatedNotesResponse:
        if filters.project_id is not None:
            await self._ensure_project_owned(filters.project_id, filters.owner_user_id)
        if filters.tag_id is not None:
            await self._ensure_tag_owned(filters.tag_id, filters.owner_user_id)

        notes, total = await self.note_repository.list(filters)
        tags_by_note = await self.note_repository.get_tags_for_notes([note.id for note in notes])
        return PaginatedNotesResponse(
            items=[
                self._build_note_response(note, tags_by_note.get(note.id, []))
                for note in notes
            ],
            total=total,
            limit=filters.limit,
            offset=filters.offset,
        )

    async def create_note(self, command: CreateNoteCommand) -> NoteResponse:
        await self._ensure_project_owned(command.project_id, command.owner_user_id)
        note = await self.note_repository.create(
            project_id=command.project_id,
            title=command.title,
            content=command.content,
            status=command.status,
            is_pinned=command.is_pinned,
        )
        return self._build_note_response(note, [])

    async def get_note(self, *, note_id: uuid.UUID, owner_user_id: uuid.UUID) -> NoteFullResponse:
        note = await self._ensure_note_owned(note_id, owner_user_id)
        tags_by_note = await self.note_repository.get_tags_for_notes([note.id])
        files = await self.note_repository.get_files_for_note(note.id)
        return self._build_note_full_response(
            note,
            tags_by_note.get(note.id, []),
            files,
        )

    async def update_note(
        self,
        *,
        note_id: uuid.UUID,
        command: UpdateNoteCommand,
    ) -> NoteFullResponse:
        note = await self._ensure_note_owned(note_id, command.owner_user_id)
        if command.title is not None:
            note.title = command.title
        if command.content is not None:
            note.content = command.content
        if command.status is not None:
            note.status = command.status
            note.archived_at = (
                datetime.now(timezone.utc)
                if command.status == NoteStatus.ARCHIVED
                else None
            )
        if command.is_pinned is not None:
            note.is_pinned = command.is_pinned

        note = await self.note_repository.update(note)
        return await self.get_note(note_id=note.id, owner_user_id=command.owner_user_id)

    async def delete_note(self, *, note_id: uuid.UUID, owner_user_id: uuid.UUID) -> None:
        note = await self._ensure_note_owned(note_id, owner_user_id)
        await self.note_repository.soft_delete_and_unlink_tasks(note)

    async def attach_tag(
        self,
        *,
        note_id: uuid.UUID,
        tag_id: uuid.UUID,
        owner_user_id: uuid.UUID,
    ) -> NoteTagLinkResponse:
        await self._ensure_note_owned(note_id, owner_user_id)
        await self._ensure_tag_owned(tag_id, owner_user_id)
        link = await self.note_repository.attach_tag(note_id=note_id, tag_id=tag_id)
        if link is None:
            raise UserAppError(code="already_exists", message="Tag already attached to this note")
        return NoteTagLinkResponse.model_validate(link)

    async def detach_tag(
        self,
        *,
        note_id: uuid.UUID,
        tag_id: uuid.UUID,
        owner_user_id: uuid.UUID,
    ) -> None:
        await self._ensure_note_owned(note_id, owner_user_id)
        await self._ensure_tag_owned(tag_id, owner_user_id)
        await self.note_repository.detach_tag(note_id=note_id, tag_id=tag_id)

    async def attach_file(
        self,
        *,
        note_id: uuid.UUID,
        file_id: uuid.UUID,
        owner_user_id: uuid.UUID,
    ) -> NoteFileLinkResponse:
        await self._ensure_note_owned(note_id, owner_user_id)
        file = await self.file_repository.get_owned(file_id=file_id, owner_user_id=owner_user_id)
        if file is None:
            raise UserAppError(code="not_found", message="File not found")
        link = await self.note_repository.attach_file(note_id=note_id, file_id=file_id)
        if link is None:
            raise UserAppError(code="already_exists", message="File already attached to this note")
        return NoteFileLinkResponse.model_validate(link)

    async def detach_file(
        self,
        *,
        note_id: uuid.UUID,
        file_id: uuid.UUID,
        owner_user_id: uuid.UUID,
    ) -> None:
        await self._ensure_note_owned(note_id, owner_user_id)
        await self.note_repository.detach_file(note_id=note_id, file_id=file_id)

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

    async def _ensure_note_owned(self, note_id: uuid.UUID, owner_user_id: uuid.UUID) -> Note:
        note = await self.note_repository.get_owned(note_id=note_id, owner_user_id=owner_user_id)
        if note is None:
            raise UserAppError(code="not_found", message="Note not found")
        return note

    async def _ensure_tag_owned(self, tag_id: uuid.UUID, owner_user_id: uuid.UUID) -> Tag:
        tag = await self.tag_repository.get_owned(tag_id=tag_id, owner_user_id=owner_user_id)
        if tag is None:
            raise UserAppError(code="not_found", message="Tag not found")
        return tag

    def _build_note_response(self, note: Note, tags: list[Tag]) -> NoteResponse:
        return NoteResponse(
            id=note.id,
            project_id=note.project_id,
            title=note.title,
            content=note.content,
            status=note.status,
            created_at=note.created_at,
            updated_at=note.updated_at,
            archived_at=note.archived_at,
            is_pinned=note.is_pinned,
            tags=[TagResponse.model_validate(tag) for tag in tags],
        )

    def _build_note_full_response(
        self,
        note: Note,
        tags: list[Tag],
        files: list[File],
    ) -> NoteFullResponse:
        note_response = self._build_note_response(note, tags)
        return NoteFullResponse(
            **note_response.model_dump(),
            files=[FileBriefResponse.model_validate(file) for file in files],
        )
