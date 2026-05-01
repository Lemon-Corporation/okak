# ОКАК — Документация

## Структура

```
docs/
├── architecture/
│   └── overview.md        — компоненты системы и как они связаны
├── db/
│   └── schema.md          — описание таблиц, enum-типов, связей
└── api/
    ├── auth.md            — регистрация, вход, профиль
    ├── projects.md        — проекты (иерархия, статусы)
    ├── notes.md           — заметки, теги, файлы к заметке
    ├── tasks.md           — задачи, приоритеты, файлы к задаче
    ├── files.md           — загрузка и отдача файлов (локально)
    ├── tags.md            — теги пользователя
    ├── search.md          — полнотекстовый поиск
    └── errors.md          — коды ошибок и формат ответа
```

## Быстрый старт

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # заполнить DATABASE_URL и SECRET_KEY
uvicorn main:app --reload
```

Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
