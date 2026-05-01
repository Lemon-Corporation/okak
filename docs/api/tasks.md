# Tasks

> Prefix: `/api/v1/tasks`  
> Все ендпоинты требуют Bearer токен.  
> Задача принадлежит проекту, проект — пользователю.

---

## Объект задачи

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "linked_note_id": null,
  "title": "Сделать X",
  "description": "",
  "status": "todo",
  "priority": "medium",
  "due_at": null,
  "created_at": "...",
  "updated_at": "...",
  "completed_at": null,
  "archived_at": null
}
```

Полный объект (GET /{id}) добавляет `"files": [...]`.

---

## GET `/tasks`

Список задач пользователя.

**Query params**
| Param | Тип | Описание |
|-------|-----|---------|
| `project_id` | uuid | фильтр по проекту |
| `status` | `task_status` | `backlog\|todo\|in_progress\|done\|cancelled` |
| `priority` | `task_priority` | `none\|low\|medium\|high\|urgent` |
| `linked_note_id` | uuid | задачи связанные с заметкой |
| `due_before` | datetime | срок ≤ дата |
| `due_after` | datetime | срок ≥ дата |
| `archived` | bool | default false |
| `limit` | int | default 50 |
| `offset` | int | default 0 |

**Response 200**
```json
{
  "items": [...],
  "total": 7,
  "limit": 50,
  "offset": 0
}
```

---

## POST `/tasks`

Создать задачу.

**Body**
```json
{
  "project_id": "uuid",
  "title": "Сделать X",
  "description": "",
  "status": "todo",
  "priority": "medium",
  "due_at": null,
  "linked_note_id": null
}
```

**Обязательные поля:** `project_id`, `title`  
**Логика:** проверить что `project_id` принадлежит пользователю; если передан `linked_note_id` — проверить что заметка тоже доступна.

**Response 201** — созданный объект.

---

## GET `/tasks/{task_id}`

Получить задачу с прикреплёнными файлами.

**Response 200** — полный объект с `"files": [...]`.  
**Ошибки:** `404`, `403`

---

## PATCH `/tasks/{task_id}`

Обновить задачу. Все поля опциональны.

**Body**
```json
{
  "title": "...",
  "description": "...",
  "status": "done",
  "priority": "high",
  "due_at": "2026-06-01T00:00:00Z",
  "linked_note_id": "uuid"
}
```

**Автоматическая логика по `status`**

| Новый status | Что происходит |
|-------------|---------------|
| `done` | `completed_at = now()`, `archived_at = null` |
| `cancelled` | `archived_at = now()`, `completed_at = null` |
| `backlog / todo / in_progress` | `completed_at = null`, `archived_at = null` |

**Response 200** — обновлённый полный объект.

---

## DELETE `/tasks/{task_id}`

Мягкое удаление задачи.

**Логика:** `archived_at = now()`, `status = cancelled`.

**Response 204**

---

## POST `/tasks/{task_id}/files`

Прикрепить файл к задаче.

**Body**
```json
{ "file_id": "uuid" }
```

**Логика:** файл должен существовать → создать запись в `task_files`.

**Response 201**
```json
{ "id": "uuid", "task_id": "uuid", "file_id": "uuid", "created_at": "..." }
```

**Ошибки:** `409 already_exists`

---

## DELETE `/tasks/{task_id}/files/{file_id}`

Открепить файл от задачи. Сам файл не удаляется.

**Response 204**
