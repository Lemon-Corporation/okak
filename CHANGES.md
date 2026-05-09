# Что сделано (Маша, фронтенд)

## Новые файлы

### `frontend/lib/session.ts`
Управление JWT-токеном в `localStorage`. Ключ `okak_access_token`.  
Методы: `session.set(token)`, `session.get()`, `session.clear()`.  
Используется в store при логине/логауте и в API-клиенте при каждом запросе.

### `frontend/lib/api/client.ts`
Базовый HTTP-клиент поверх `fetch`.  
- Автоматически добавляет `Authorization: Bearer <token>` из session
- Парсит ошибки бэкенда в формате `{ detail, code }` и бросает `ApiError`
- `api.get / api.post / api.patch / api.delete` — единая точка входа для всех запросов
- `BASE_URL` берётся из `NEXT_PUBLIC_API_URL`, по умолчанию `http://localhost:8000/api/v1`

### `frontend/lib/api/dto.ts`
TypeScript-типы для сырых ответов бэкенда:  
`BackendUser`, `AuthResponse`, `BackendProject`, `BackendNote`, `BackendTask`, `BackendFile`,  
`BackendTag`, `BackendFileRef`, `PaginatedResponse<T>`, `SearchResponse`, `SearchNote`, `SearchTask`, `SearchProject`.

### `frontend/lib/api/auth.ts`
`authApi.register()`, `authApi.login()`, `authApi.me()`, `authApi.updateMe()`.  
Вызывает `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PATCH /auth/me`.

### `frontend/lib/api/projects.ts`
`projectsApi.list()`, `.get()`, `.create()`, `.update()`, `.delete()`.  
Полное CRUD по `/projects`.

### `frontend/lib/api/notes.ts`
`notesApi.list()`, `.get()`, `.create()`, `.update()`, `.delete()`.  
Плюс методы тегов и файлов: `.addTag()`, `.removeTag()`, `.attachFile()`, `.detachFile()`.

### `frontend/lib/api/tasks.ts`
`tasksApi.list()`, `.get()`, `.create()`, `.update()`, `.delete()`.  
Плюс `.attachFile()`, `.detachFile()`.

### `frontend/lib/api/files.ts`
`filesApi.upload(file, projectId)` — multipart upload.  
`filesApi.get(id)`, `filesApi.downloadUrl(id)`, `filesApi.delete(id)`.

### `frontend/lib/api/search.ts`
`searchApi.search(q, kind?, limit?)` — вызывает `GET /search`.

### `frontend/lib/api/index.ts`
Реэкспорт всех API-модулей и DTO-типов из одной точки.

---

## Изменённые файлы

### `frontend/lib/store.ts`
**Auth (задача 2):**
- `login(email, password)` → теперь `async`, вызывает `authApi.login()`, сохраняет токен через `session.set()`, маппит `BackendUser` → `User`
- `register(email, password, name)` → теперь `async`, вызывает `authApi.register()`
- `logout()` → очищает токен через `session.clear()`, сбрасывает всё состояние

**Загрузка данных (задача 3):**
- `loadProjects()` — async метод, тянет список проектов из API, сохраняет в store (цвет проекта сохраняется локально)
- `loadNotes()` — async метод, тянет заметки из API
- `loadTasks()` — async метод, тянет задачи из API; маппит статусы и приоритеты бэкенда → фронтенд-значения

**CRUD (задача 4 — убираем зависимость от mock):**
- `createNote / createTask / createProject` → теперь `async`, сначала вызывают API, при успехе кладут результат в store; при ошибке (API недоступен) — fallback на локальный объект
- `updateNote / updateTask / updateProject` → optimistic update в store, параллельно патчат бэкенд (ошибка не блокирует UI)
- `deleteNote / deleteTask / deleteProject` → то же: удаляем из store, удаляем на бэкенде

**Маппинг статусов задач:**
| Backend | Frontend |
|---------|----------|
| `todo` | `todo` |
| `in_progress` | `in-progress` |
| `done` | `done` |
| `backlog`, `cancelled` | `todo` |

**Маппинг приоритетов:**
| Backend | Frontend |
|---------|----------|
| `none`, `low` | `low` |
| `medium` | `medium` |
| `high`, `urgent` | `high` |

Удалён импорт `seedMockData` — mock-данные больше не подключаются при старте.

### `frontend/app/(auth)/login/page.tsx`
- Убрана имитация задержки (`setTimeout`)
- Убрана hardcode-логика демо-аккаунта
- `login()` теперь `await`, ошибки из `ApiError` выводятся в форму (маппинг `invalid_credentials` → русский текст)
- Убрана подсказка с demo@example.com

### `frontend/app/(auth)/register/page.tsx`
- Убрана имитация задержки
- Минимальная длина пароля исправлена с 6 до 8 символов (по контракту `docs/api/auth.md`)
- `register()` теперь `await`, ошибки из `ApiError` (`email_taken`) — русский текст

### `frontend/app/(app)/layout.tsx`
- Убран вызов `seedMockData`
- После успешной аутентификации вызываются `loadProjects()`, `loadNotes()`, `loadTasks()` — данные подтягиваются из бэкенда при каждом запуске приложения

### `frontend/components/overlay.tsx`
- Добавлен debounced backend-поиск через `searchApi.search()` (задержка 300 мс)
- При успешном ответе API результаты показываются вместо локального поиска
- При ошибке API (бэкенд недоступен) — автоматический fallback на локальный поиск по store
- `handleCreateNote` и `handleCreateTask` стали `async` (ждут результат, затем навигируют)

---

## Что НЕ менялось
- UI-компоненты страниц (`projects/page.tsx`, `notes/page.tsx`, `tasks/page.tsx`, `files/page.tsx`) — продолжают читать из store, данные в store теперь реальные
- TypeScript-типы в `frontend/lib/types.ts` — не менялись, DTO-типы вынесены отдельно в `api/dto.ts`
- `frontend/lib/utils.ts` — не менялся
- Backend-код — без изменений

---

## Переменные окружения
Добавить в `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
