from app.core.config import settings


async def chat(messages: list[dict], tools: list[dict] | None = None) -> dict:
    """Send messages to the configured LLM provider and return its response."""
    if settings.llm_provider == "openai":
        return await _openai_chat(messages, tools)
    return await _qwen_chat(messages, tools)


async def _openai_chat(messages: list[dict], tools: list[dict] | None) -> dict:
    import openai

    client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
    kwargs: dict = {"model": "gpt-4o-mini", "messages": messages}
    if tools:
        kwargs["tools"] = tools
    response = await client.chat.completions.create(**kwargs)
    return response.choices[0].message.model_dump()


async def _qwen_chat(messages: list[dict], tools: list[dict] | None) -> dict:
    import openai

    client = openai.AsyncOpenAI(
        api_key=settings.qwen_api_key,
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )
    kwargs: dict = {"model": "qwen-plus", "messages": messages}
    if tools:
        kwargs["tools"] = tools
    response = await client.chat.completions.create(**kwargs)
    return response.choices[0].message.model_dump()
