from typing import Annotated
import os

from fastapi import APIRouter, Depends, status, UploadFile, File
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.ioc.container import AppContainer
from app.presentation.dependencies import get_container, get_current_user
from app.schemas.ai import ChatRequest, ChatResponse, TTSRequest
from app.schemas.auth import UserRecord
from app.services.llm import chat as llm_chat
from app.services.tts import synthesize_speech

router = APIRouter()


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat_endpoint(
    body: ChatRequest,
    container: Annotated[AppContainer, Depends(get_container)],
    current_user: Annotated[UserRecord, Depends(get_current_user)],
) -> ChatResponse:
    return await container.ai_agent_service.chat(
        owner_user_id=current_user.id,
        request=body,
    )


@router.post("/ask", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def ask_endpoint(
    body: ChatRequest,
    container: Annotated[AppContainer, Depends(get_container)],
) -> ChatResponse:
    """Simple LLM endpoint for voice assistant — no auth, no projects required."""
    messages = [{"role": m.role, "content": m.content} for m in body.messages]
    if body.message:
        messages.append({"role": "user", "content": body.message})

    response = await llm_chat(messages)
    return ChatResponse(
        role=response.get("role", "assistant"),
        content=response.get("content", ""),
    )


@router.post("/tts", status_code=status.HTTP_200_OK)
async def tts_endpoint(
    body: TTSRequest,
):
    audio_path = await synthesize_speech(body.text)

    # We clean up the temp file after sending it
    def cleanup() -> None:
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


from fastapi import APIRouter, Depends, status, UploadFile, File, HTTPException
...
@router.post("/stt", status_code=status.HTTP_200_OK)
async def stt_endpoint(
    container: Annotated[AppContainer, Depends(get_container)],
    file: UploadFile = File(...),
):
    """Simple STT endpoint — no auth required."""
    try:
        audio_data = await file.read()
        transcript = await container.llm_client.stt(audio_data)
        return {"transcript": transcript}
    except Exception as e:
        import traceback
        print(f"STT Error: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) from e
