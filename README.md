# ОКАК

Веб-приложение для заметок, задач, проектов и файлов с боковой навигацией и overlay для быстрого создания сущностей. Сейчас данные и вход хранятся локально (демо на Zustand + persist).

## Требования

- **Node.js** 20+ (рекомендуется LTS)
- **pnpm** (в репозитории используется `pnpm-lock.yaml`)

## Установка и запуск

```bash
pnpm install
pnpm dev
```

Приложение откроется по адресу [http://localhost:3000](http://localhost:3000).

### Другие команды

| Команда      | Назначение              |
|-------------|-------------------------|
| `pnpm dev`  | режим разработки (Next.js) |
| `pnpm build`| production-сборка       |
| `pnpm start`| запуск после `build`    |
| `pnpm lint` | проверка ESLint         |

Frontend по-прежнему запускается отдельно через `pnpm install` и `pnpm dev`.

## Backend

### Docker Compose

```bash
cd backend
cp .env.example .env
docker compose up --build backend -d
```

Compose поднимает PostgreSQL 16 и backend API. Миграции Alembic применяются автоматически при старте backend service, затем приложение запускается через `uvicorn`.
Backend service читает переменные из `backend/.env`; для контейнерного запуска compose переопределяет хост PostgreSQL на `postgres`.

Адреса:

| URL | Назначение |
|-----|------------|
| [http://localhost:8000](http://localhost:8000) | Backend API |
| [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI |
| [http://localhost:8000/health](http://localhost:8000/health) | Healthcheck |

### Локальный запуск без Docker

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Для локального запуска без Docker нужен доступный PostgreSQL, параметры подключения задаются в `.env` через переменные `OKAK_POSTGRES__*`.

## Основные страницы

### Публичные

| Путь        | Описание                          |
|------------|-----------------------------------|
| `/`        | Лендинг с описанием продукта      |
| `/login`   | Вход                              |
| `/register`| Регистрация                       |
| `/pricing` | Тарифы                            |

### Приложение (после входа)

Защищённые маршруты группы `(app)` — без авторизации выполняется редирект на `/login`.

| Путь              | Описание                    |
|-------------------|-----------------------------|
| `/space`          | Пространство (обзор)        |
| `/projects`       | Список проектов             |
| `/projects/[id]`  | Карточка проекта            |
| `/notes`          | Заметки                     |
| `/notes/[id]`     | Редактирование заметки      |
| `/tasks`          | Задачи                      |
| `/files`          | Файлы                       |
| `/settings`       | Настройки профиля и аккаунта|

В сайдбаре: кнопка **«Быстрое создание»** и глобальная горячая клавиша **Ctrl+Space** или **⌘+Space** (macOS) открывают overlay.

## Тема и внешний вид

- **Tailwind CSS v4** и переменные в `app/globals.css`.
- Палитра на **OKLCH**: фон, текст, акценты, границы, палитра для графиков (`--chart-*`), отдельные токены для **сайдбара** (`--sidebar-*`).
- **Светлая и тёмная** схемы: корневые переменные в `:root`, тёмная — в селекторе `.dark` (класс на контейнере; вариант `@custom-variant dark` завязан на `.dark *`).
- Шрифты: **Geist** и **Geist Mono** (Next.js `next/font/google`).
- UI: компоненты в духе **shadcn/ui** на **Radix UI**; иконки **Lucide**.

Зависимость **next-themes** и обёртка `components/theme-provider.tsx` используются для согласования темы с уведомлениями (например, Sonner); при необходимости провайдер можно подключить в корневой layout.

## Данные и состояние

- **Zustand** (`lib/store.ts`) — пользователь, сущности, overlay, сайдбар.
- **persist** — часть состояния сохраняется в браузере; при первом заходе подмешиваются **mock-данные** (`lib/mock-data.ts`).
- Регистрация/вход — демо без бэкенда.

## Стек

- **Next.js** 16 (App Router), **React** 19, **TypeScript**
- **Tailwind CSS** v4 (`@import 'tailwindcss'` в `app/globals.css`)
- **Vercel Analytics** подключается в production в `app/layout.tsx`

---

## Desktop (Electron)

```bash
cd desktop
pnpm dev
```

Откроется Electron с загруженным frontend dev-сервером.

Подробнее: [`desktop/README.md`](desktop/README.md)

---

Локальная разработка: достаточно `pnpm install` и `pnpm dev`.
