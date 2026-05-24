import time
import uuid
from dataclasses import dataclass
from typing import Any

from app.config.settings import LLMSettings
from app.core.config import settings


class LLMProviderUnavailable(RuntimeError):
    pass


@dataclass(slots=True)
class LLMClient:
    settings: LLMSettings
    _access_token: str | None = None
    _expires_at_ms: int = 0

    def is_configured(self) -> bool:
        if self.settings.provider == "gigachat":
            return bool(self.settings.gigachat_auth_key)
        if self.settings.provider == "openai":
            return bool(self.settings.openai_api_key)
        if self.settings.provider == "qwen":
            return bool(self.settings.qwen_api_key)
        return False

    async def chat(
        self,
        messages: list[dict[str, Any]],
        *,
        tools: list[dict[str, Any]] | None = None,
        functions: list[dict[str, Any]] | None = None,
        function_call: str | dict[str, Any] | None = None,
        temperature: float = 0.2,
        max_tokens: int | None = None,
    ) -> dict[str, Any]:
        if self.settings.provider == "gigachat":
            return await self._gigachat_chat(
                messages,
                functions=functions,
                function_call=function_call,
                temperature=temperature,
                max_tokens=max_tokens,
            )
        if self.settings.provider == "openai":
            return await self._openai_chat(
                messages,
                tools=tools,
                temperature=temperature,
                max_tokens=max_tokens,
            )
        if self.settings.provider == "qwen":
            return await self._qwen_chat(
                messages,
                tools=tools,
                temperature=temperature,
                max_tokens=max_tokens,
            )
        raise LLMProviderUnavailable(f"Unsupported LLM provider: {self.settings.provider}")

    async def _gigachat_chat(
        self,
        messages: list[dict[str, Any]],
        *,
        functions: list[dict[str, Any]] | None,
        function_call: str | dict[str, Any] | None,
        temperature: float,
        max_tokens: int | None,
    ) -> dict[str, Any]:
        import httpx

        if not self.settings.gigachat_auth_key:
            raise LLMProviderUnavailable("GigaChat credentials are not configured")

        token = await self._get_gigachat_token()
        payload: dict[str, Any] = {
            "model": self.settings.gigachat_model,
            "messages": messages,
            "temperature": temperature,
        }
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
        if functions:
            payload["functions"] = functions
            payload["function_call"] = function_call or "auto"

        async with httpx.AsyncClient(
            timeout=self.settings.request_timeout_seconds,
            verify=False, # Disable SSL verification for GigaChat
        ) as client:
            response = await client.post(
                f"{self.settings.gigachat_base_url.rstrip('/')}/chat/completions",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            response.raise_for_status()

        data = response.json()
        return data["choices"][0]["message"]

    async def _get_gigachat_token(self) -> str:
        import httpx

        now_ms = int(time.time() * 1000)
        if self._access_token and self._expires_at_ms - 60_000 > now_ms:
            return self._access_token

        async with httpx.AsyncClient(
            timeout=self.settings.request_timeout_seconds,
            verify=False, # Disable SSL verification for GigaChat Auth
        ) as client:
            response = await client.post(
                self.settings.gigachat_auth_url,
                headers={
                    "Authorization": f"Basic {self.settings.gigachat_auth_key}",
                    "RqUID": str(uuid.uuid4()),
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data={"scope": "GIGACHAT_API_B2B"},
            )
            if response.status_code != 200:
                print(f"GigaChat Auth Error {response.status_code}: {response.text}")
            response.raise_for_status()

        data = response.json()
        self._access_token = data["access_token"]
        self._expires_at_ms = int(data.get("expires_at") or now_ms + 30 * 60 * 1000)
        return self._access_token

    async def _openai_chat(
        self,
        messages: list[dict[str, Any]],
        *,
        tools: list[dict[str, Any]] | None,
        temperature: float,
        max_tokens: int | None,
    ) -> dict[str, Any]:
        if not self.settings.openai_api_key:
            raise LLMProviderUnavailable("OpenAI credentials are not configured")
        import openai

        client = openai.AsyncOpenAI(api_key=self.settings.openai_api_key)
        kwargs: dict[str, Any] = {
            "model": "gpt-4o-mini",
            "messages": messages,
            "temperature": temperature,
        }
        if tools:
            kwargs["tools"] = tools
        if max_tokens is not None:
            kwargs["max_tokens"] = max_tokens
        response = await client.chat.completions.create(**kwargs)
        return response.choices[0].message.model_dump()

    async def _qwen_chat(
        self,
        messages: list[dict[str, Any]],
        *,
        tools: list[dict[str, Any]] | None,
        temperature: float,
        max_tokens: int | None,
    ) -> dict[str, Any]:
        if not self.settings.qwen_api_key:
            raise LLMProviderUnavailable("Qwen credentials are not configured")
        import openai

        client = openai.AsyncOpenAI(
            api_key=self.settings.qwen_api_key,
            base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
        )
        kwargs: dict[str, Any] = {
            "model": "qwen-plus",
            "messages": messages,
            "temperature": temperature,
        }
        if tools:
            kwargs["tools"] = tools
        if max_tokens is not None:
            kwargs["max_tokens"] = max_tokens
        response = await client.chat.completions.create(**kwargs)
        return response.choices[0].message.model_dump()


    async def stt(self, audio_data: bytes) -> str:
        """Transcribe audio using the configured provider."""
        if self.settings.provider == "gigachat":
            return await self._gigachat_stt(audio_data)
        raise LLMProviderUnavailable(f"STT not supported for provider: {self.settings.provider}")

    async def _gigachat_stt(self, audio_data: bytes) -> str:
        import httpx

        if not self.settings.gigachat_auth_key:
            raise LLMProviderUnavailable("GigaChat credentials are not configured")

        token = await self._get_gigachat_token()
        
        async with httpx.AsyncClient(
            timeout=self.settings.request_timeout_seconds,
            verify=False, # Disable SSL verification for GigaChat STT
        ) as client:
            response = await client.post(
                "https://gigachat.devices.sberbank.ru/api/v1/speech/transcriptions",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "audio/webm",
                },
                content=audio_data,
            )
            if response.status_code != 200:
                print(f"GigaChat STT Error {response.status_code}: {response.text}")
            response.raise_for_status()

        data = response.json()
        return data.get("result", [""])[0]

async def chat(messages: list[dict], tools: list[dict] | None = None) -> dict:
    """Send messages to the configured LLM provider and return its response."""
    return await LLMClient(settings.llm).chat(messages, tools=tools)
