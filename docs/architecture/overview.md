# Архитектура системы

## Компоненты

```
Пользователь
    │
    ├──▶ Frontend (Next.js / React)        :3000
    │        │  REST JSON
    │        ▼
    └──▶ Backend (FastAPI / Python)        :8000
              │
              ├── PostgreSQL               — основная БД
              ├── /uploads на диске        — файлы пользователей (локально)
              └── LLM API (OpenAI / Qwen)  — внешний сервис
```

## Принципы (стартап-фаза)

- **Без S3.** Файлы хранятся на диске в папке `backend/uploads/`. Путь настраивается через `UPLOADS_DIR` в `.env`.
- **Без очередей.** Все операции синхронные (async FastAPI).
- **Без кеша.** Прямые запросы в PostgreSQL.
- **Один сервер.** Монолит, без микросервисов.

## Стек

| Слой | Технология |
|------|-----------|
| API | FastAPI + Pydantic v2 |
| ORM | SQLAlchemy 2 (async) |
| БД | PostgreSQL 16 |
| Миграции | Alembic |
| Аутентификация | JWT (python-jose) + bcrypt |
| Хранение файлов | Локальная FS (`/uploads`) |
| LLM | OpenAI SDK (совместим с Qwen через base_url) |

## Поток запроса

```
HTTP Request
  → CORS Middleware
  → JWT Middleware (извлечь user_id)
  → Router (выбрать хендлер)
  → Service Layer (бизнес-логика)
  → Repository / ORM (запрос в БД)
  → Response
```
