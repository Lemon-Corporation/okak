import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.note import Note

router = APIRouter()


class NoteIn(BaseModel):
    title: str = ""
    content: str = ""


class NoteOut(BaseModel):
    id: uuid.UUID
    title: str
    content: str

    class Config:
        from_attributes = True


@router.get("/", response_model=list[NoteOut])
async def list_notes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Note))
    return result.scalars().all()


@router.post("/", response_model=NoteOut, status_code=201)
async def create_note(body: NoteIn, db: AsyncSession = Depends(get_db)):
    note = Note(**body.model_dump())
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.patch("/{note_id}", response_model=NoteOut)
async def update_note(note_id: uuid.UUID, body: NoteIn, db: AsyncSession = Depends(get_db)):
    note = await db.get(Note, note_id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(note, k, v)
    await db.commit()
    await db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=204)
async def delete_note(note_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    note = await db.get(Note, note_id)
    await db.delete(note)
    await db.commit()
