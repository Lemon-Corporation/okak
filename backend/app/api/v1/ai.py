from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.ioc.container import AppContainer
from app.presentation.dependencies import get_container, get_current_user
from app.schemas.ai import ChatRequest, ChatResponse
from app.schemas.auth import UserRecord
from app.services.llm import chat

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
