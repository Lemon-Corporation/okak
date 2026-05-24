import json
import re
import uuid
from dataclasses import dataclass
from typing import Any

from app.exceptions.base import UserAppError
from app.repository.ai_context import (
    AIContextRepository,
    ProjectAIContextRecord,
    ProjectAISummaryRecord,
)
from app.schemas.ai import AISource, AIUsedProject, ChatRequest, ChatResponse
from app.services.llm import LLMClient
from app.services.notes import NoteService
from app.schemas.notes import NoteCreate
from app.services.projects import ProjectService
from app.schemas.projects import CreateProjectCommand
from app.services.tasks import TaskService
from app.schemas.tasks import CreateTaskCommand


@dataclass(frozen=True, slots=True)
class ProjectAgentResult:
    answer: str
    used_project: AIUsedProject
    sources: list[AISource]


@dataclass(slots=True, kw_only=True)
class ProjectAgentService:
    ai_context_repository: AIContextRepository
    llm_client: LLMClient

    async def ask(
        self,
        *,
        owner_user_id: uuid.UUID,
        project_id: uuid.UUID,
        question: str,
    ) -> ProjectAgentResult:
        record = await self.ai_context_repository.collect_project_context(
            project_id=project_id,
            owner_user_id=owner_user_id,
        )
        if record is None:
            raise UserAppError(code="not_found", message="Project not found")

        context = self._format_project_context(record, max_chars=18_000)
        answer = self._fallback_answer(record, question)

        if self.llm_client.is_configured():
            try:
                response = await self.llm_client.chat(
                    [
                        {
                            "role": "system",
                            "content": (
                                "You are a project-specific agent. Use only the provided project context. "
                                "If the context is insufficient, say what is missing. "
                                "Answer in the user's language and keep the answer practical."
                            ),
                        },
                        {"role": "user", "content": f"Question:\n{question}\n\nProject context:\n{context}"},
                    ],
                    temperature=0.2,
                    max_tokens=1200,
                )
                content = (response.get("content") or "").strip()
                if content:
                    answer = content
            except Exception:
                pass

        return ProjectAgentResult(
            answer=answer,
            used_project=AIUsedProject(id=record.project.id, title=record.project.title),
            sources=self._build_sources(record),
        )

    def _fallback_answer(self, record: ProjectAIContextRecord, question: str) -> str:
        lines = [
            f"Project: {record.project.title}",
            record.context.summary if record.context and record.context.summary else record.project.description,
        ]
        if record.tasks:
            lines.append("Relevant tasks:")
            lines.extend(f"- {task.title} [{task.status.value}, {task.priority.value}]" for task in record.tasks[:8])
        if record.notes:
            lines.append("Relevant notes:")
            lines.extend(f"- {note.title}: {self._trim(note.content, 240)}" for note in record.notes[:5])
        return "\n".join(line for line in lines if line)

    def _format_project_context(self, record: ProjectAIContextRecord, *, max_chars: int) -> str:
        chunks = [
            f"PROJECT\nID: {record.project.id}\nTitle: {record.project.title}\nDescription: {record.project.description}",
        ]
        if record.context and record.context.summary:
            chunks.append(f"PROJECT MEMORY\n{record.context.summary}")
        chunks.append("NOTES")
        for note in record.notes:
            chunks.append(
                f"NOTE {note.id}\nTitle: {note.title}\nStatus: {note.status.value}\nContent: {self._trim(note.content, 1600)}"
            )
        chunks.append("TASKS")
        for task in record.tasks:
            chunks.append(
                f"TASK {task.id}\nTitle: {task.title}\nStatus: {task.status.value}\nPriority: {task.priority.value}\nDescription: {self._trim(task.description, 1000)}"
            )
        chunks.append("FILES")
        for file in record.files:
            chunks.append(f"FILE {file.id}\nName: {file.original_name}\nMime: {file.mime_type or 'unknown'}")
        return self._trim("\n\n".join(chunks), max_chars)

    def _build_sources(self, record: ProjectAIContextRecord) -> list[AISource]:
        sources: list[AISource] = []
        sources.extend(
            AISource(type="note", id=note.id, title=note.title, project_id=note.project_id)
            for note in record.notes[:8]
        )
        sources.extend(
            AISource(type="task", id=task.id, title=task.title, project_id=task.project_id)
            for task in record.tasks[:8]
        )
        sources.extend(
            AISource(type="file", id=file.id, title=file.original_name, project_id=file.project_id)
            for file in record.files[:5]
        )
        return sources

    def _trim(self, value: str, max_chars: int) -> str:
        if len(value) <= max_chars:
            return value
        return value[: max_chars - 3].rstrip() + "..."


@dataclass(slots=True, kw_only=True)
class AIAgentService:
    ai_context_repository: AIContextRepository
    project_agent_service: ProjectAgentService
    llm_client: LLMClient
    note_service: NoteService | None = None
    project_service: ProjectService | None = None
    task_service: TaskService | None = None

    async def chat(
        self,
        *,
        owner_user_id: uuid.UUID,
        request: ChatRequest,
    ) -> ChatResponse:
        question = self._extract_question(request)
        project_summaries = await self.ai_context_repository.list_project_summaries(
            owner_user_id=owner_user_id,
        )
        if not project_summaries:
            return ChatResponse(
                role="assistant",
                content="No projects are available yet. Create a project first, then I can answer with project context.",
                conversation_id=request.conversation_id,
            )

        if not self.llm_client.is_configured():
            return await self._fallback_chat(
                owner_user_id=owner_user_id,
                request=request,
                question=question,
                project_summaries=project_summaries,
            )

        messages = self._build_main_messages(request, question, project_summaries)
        functions = [self._ask_project_agent_function()]
        try:
            first_response = await self.llm_client.chat(
                messages,
                functions=functions,
                function_call="auto",
                temperature=0.2,
                max_tokens=900,
            )
        except Exception:
            return await self._fallback_chat(
                owner_user_id=owner_user_id,
                request=request,
                question=question,
                project_summaries=project_summaries,
            )

        function_call = self._extract_function_call(first_response)
        
        # 1. Сначала проверяем, нет ли кастомной текстовой команды [CREATE_NOTE: ...]
        content = (first_response.get("content") or "").strip()
        
        # 1. Заметка
        create_note_match = re.search(r'\[CREATE_NOTE:\s*project_id="([^"]+)",\s*title="([^"]+)",\s*content="([^"]+)"\]', content)
        if create_note_match and self.note_service:
            try:
                p_id = uuid.UUID(create_note_match.group(1))
                title = create_note_match.group(2)
                note_content = create_note_match.group(3)
                await self.note_service.create_note(
                    owner_user_id=owner_user_id,
                    project_id=p_id,
                    data=NoteCreate(title=title, content=note_content)
                )
                return ChatResponse(
                    role="assistant",
                    content=f"Я успешно создал заметку «{title}»!",
                    conversation_id=request.conversation_id,
                )
            except Exception as e:
                return ChatResponse(
                    role="assistant",
                    content=f"Не удалось создать заметку: {e}",
                    conversation_id=request.conversation_id,
                )
                
        # 2. Проект
        create_project_match = re.search(r'\[CREATE_PROJECT:\s*title="([^"]+)",\s*description="([^"]*)"\]', content)
        if create_project_match and self.project_service:
            try:
                title = create_project_match.group(1)
                desc = create_project_match.group(2)
                await self.project_service.create_project(
                    command=CreateProjectCommand(
                        owner_user_id=owner_user_id,
                        title=title,
                        description=desc,
                    )
                )
                return ChatResponse(
                    role="assistant",
                    content=f"Я успешно создал проект «{title}»!",
                    conversation_id=request.conversation_id,
                )
            except Exception as e:
                return ChatResponse(
                    role="assistant",
                    content=f"Не удалось создать проект: {e}",
                    conversation_id=request.conversation_id,
                )
                
        # 3. Задача
        create_task_match = re.search(r'\[CREATE_TASK:\s*project_id="([^"]+)",\s*title="([^"]+)",\s*description="([^"]*)"\]', content)
        if create_task_match and self.task_service:
            try:
                p_id = uuid.UUID(create_task_match.group(1))
                title = create_task_match.group(2)
                desc = create_task_match.group(3)
                await self.task_service.create_task(
                    command=CreateTaskCommand(
                        owner_user_id=owner_user_id,
                        project_id=p_id,
                        title=title,
                        description=desc,
                    )
                )
                return ChatResponse(
                    role="assistant",
                    content=f"Я успешно создал задачу «{title}»!",
                    conversation_id=request.conversation_id,
                )
            except Exception as e:
                return ChatResponse(
                    role="assistant",
                    content=f"Не удалось создать задачу: {e}",
                    conversation_id=request.conversation_id,
                )

        if function_call is None:
            content = (first_response.get("content") or "").strip()
            if content:
                return ChatResponse(
                    role=first_response.get("role", "assistant"),
                    content=content,
                    conversation_id=request.conversation_id,
                )
            return await self._fallback_chat(
                owner_user_id=owner_user_id,
                request=request,
                question=question,
                project_summaries=project_summaries,
            )

        project_result = await self._execute_project_agent_call(
            owner_user_id=owner_user_id,
            question=question,
            function_call=function_call,
        )
        final_content = project_result.answer
        try:
            final_response = await self.llm_client.chat(
                messages
                + [
                    {
                        "role": "assistant",
                        "content": first_response.get("content") or "",
                        "function_call": {
                            "name": function_call["name"],
                            "arguments": json.dumps(function_call["arguments"], ensure_ascii=False),
                        },
                    },
                    {
                        "role": "function",
                        "name": function_call["name"],
                        "content": json.dumps(
                            {
                                "answer": project_result.answer,
                                "sources": [source.model_dump(mode="json") for source in project_result.sources],
                            },
                            ensure_ascii=False,
                        ),
                    },
                ],
                temperature=0.2,
                max_tokens=900,
            )
            content = (final_response.get("content") or "").strip()
            if content:
                final_content = content
        except Exception:
            pass

        return ChatResponse(
            role="assistant",
            content=final_content,
            conversation_id=request.conversation_id,
            used_projects=[project_result.used_project],
            sources=project_result.sources,
        )

    async def _fallback_chat(
        self,
        *,
        owner_user_id: uuid.UUID,
        request: ChatRequest,
        question: str,
        project_summaries: list[ProjectAISummaryRecord],
    ) -> ChatResponse:
        project = self._pick_project(question, project_summaries)
        if project is None:
            return ChatResponse(
                role="assistant",
                content=(
                    "I need more detail to choose a project. Mention the project name or ask about a specific task, note, or file."
                ),
                conversation_id=request.conversation_id,
            )
        project_result = await self.project_agent_service.ask(
            owner_user_id=owner_user_id,
            project_id=project.project.id,
            question=question,
        )
        return ChatResponse(
            role="assistant",
            content=project_result.answer,
            conversation_id=request.conversation_id,
            used_projects=[project_result.used_project],
            sources=project_result.sources,
        )

    async def _execute_project_agent_call(
        self,
        *,
        owner_user_id: uuid.UUID,
        question: str,
        function_call: dict[str, Any],
    ) -> ProjectAgentResult:
        arguments = function_call["arguments"]
        project_id = uuid.UUID(str(arguments["project_id"]))
        project_question = str(arguments.get("question") or question)
        return await self.project_agent_service.ask(
            owner_user_id=owner_user_id,
            project_id=project_id,
            question=project_question,
        )

    def _build_main_messages(
        self,
        request: ChatRequest,
        question: str,
        project_summaries: list[ProjectAISummaryRecord],
    ) -> list[dict[str, Any]]:
        messages = [
            {
                "role": "system",
                "content": (
                    "You are the main workspace agent. You know only high-level project summaries. "
                    "If answering requires detailed project context, call ask_project_agent. "
                    "Do not invent project facts. Answer in the user's language.\n\n"
                    "*** IMPORTANT TOOL INSTRUCTIONS ***\n"
                    "If the user asks you to CREATE A NOTE, you must output EXACTLY the following text format and nothing else:\n"
                    "[CREATE_NOTE: project_id=\"<uuid>\", title=\"<note title>\", content=\"<note content>\"]\n"
                    "If the user asks you to CREATE A PROJECT, output EXACTLY:\n"
                    "[CREATE_PROJECT: title=\"<project title>\", description=\"<project desc>\"]\n"
                    "If the user asks you to CREATE A TASK, output EXACTLY:\n"
                    "[CREATE_TASK: project_id=\"<uuid>\", title=\"<task title>\", description=\"<task desc>\"]\n"
                    "If the user does not specify which project to add the note or task to, you MUST ask them to clarify before outputting the command.\n"
                    "*** END OF INSTRUCTIONS ***\n\n"
                    f"Available project summaries:\n{self._format_project_summaries(project_summaries)}"
                ),
            },
            *[message.model_dump() for message in request.messages[-10:] if message.role in {"user", "assistant"}],
        ]
        if request.message is not None:
            messages.append({"role": "user", "content": question})
        return messages

    def _format_project_summaries(self, project_summaries: list[ProjectAISummaryRecord]) -> str:
        lines = []
        for item in project_summaries:
            summary = item.context.summary if item.context and item.context.summary else item.project.description
            lines.append(
                f"- id={item.project.id}; title={item.project.title}; status={item.project.status.value}; summary={self._trim(summary, 600)}"
            )
        return "\n".join(lines)

    def _extract_question(self, request: ChatRequest) -> str:
        if request.message:
            return request.message.strip()
        for message in reversed(request.messages):
            if message.role == "user" and message.content.strip():
                return message.content.strip()
        raise UserAppError(code="invalid_request", message="Question is required")

    def _extract_function_call(self, message: dict[str, Any]) -> dict[str, Any] | None:
        raw_call = message.get("function_call")
        if raw_call is None and message.get("tool_calls"):
            first_tool = message["tool_calls"][0]
            raw_call = first_tool.get("function")
        if not raw_call:
            return None
        name = raw_call.get("name")
        if name != "ask_project_agent":
            return None
        arguments = raw_call.get("arguments") or {}
        if isinstance(arguments, str):
            arguments = json.loads(arguments)
        return {"name": name, "arguments": arguments}

    def _ask_project_agent_function(self) -> dict[str, Any]:
        return {
            "name": "ask_project_agent",
            "description": "Ask a project-specific agent when the user question requires full context from one project.",
            "parameters": {
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "UUID of the project from the available project summaries.",
                    },
                    "question": {
                        "type": "string",
                        "description": "Concrete question for the project agent.",
                    },
                },
                "required": ["project_id", "question"],
            },
        }

    def _pick_project(
        self,
        question: str,
        project_summaries: list[ProjectAISummaryRecord],
    ) -> ProjectAISummaryRecord | None:
        question_words = set(self._words(question))
        best: tuple[int, ProjectAISummaryRecord] | None = None
        for item in project_summaries:
            haystack = " ".join(
                [
                    item.project.title,
                    item.project.description,
                    item.context.summary if item.context else "",
                ]
            )
            score = len(question_words & set(self._words(haystack)))
            if best is None or score > best[0]:
                best = (score, item)
        if best is None:
            return None
        if best[0] == 0 and len(project_summaries) != 1:
            return None
        return best[1]

    def _words(self, value: str) -> list[str]:
        return [word for word in re.split(r"\W+", value.lower()) if len(word) >= 3]

    def _trim(self, value: str | None, max_chars: int) -> str:
        if not value:
            return ""
        if len(value) <= max_chars:
            return value
        return value[: max_chars - 3].rstrip() + "..."
