from typing import Annotated
import os

from fastapi import APIRouter, Depends, status
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.ioc.container import AppContainer
from app.presentation.dependencies import get_container, get_current_user
from app.schemas.ai import ChatRequest, ChatResponse, TTSRequest
from app.schemas.auth import UserRecord
from app.services.llm import chat
from app.services.tts import synthesize_speech

router = APIRouter()


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat_endpoint(
    body: ChatRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> ChatResponse:
    messages = [{"role": m.role, "content": m.content} for m in body.messages]
    response = await chat(messages)
    return ChatResponse(role=response.get("role", "assistant"), content=response.get("content", ""))


@router.post("/tts", status_code=status.HTTP_200_OK)
async def tts_endpoint(
    body: TTSRequest,
    container: Annotated[AppContainer, Depends(get_container)],
):
    audio_path = await synthesize_speech(body.text)
    
    # We clean up the temp file after sending it
    def cleanup():
        try:
            os.remove(audio_path)
        except Exception:
            pass
            
    return FileResponse(
        path=audio_path,
        media_type="audio/wav",
        filename="speech.wav",
        background=BackgroundTask(cleanup)
    )
