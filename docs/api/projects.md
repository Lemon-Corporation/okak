# Projects

> Prefix: `/api/v1/projects`  
> Все ендпоинты требуют Bearer токен.  
> Пользователь видит только свои проекты (`owner_user_id = current_user.id`).

---

## Объект проекта

```json
{
  "id": "uuid",
  "owner_user_id": "uuid",
  "parent_project_id": null,
  "kind": "project",
  "title": "Мой проект",
  "description": "Описание",
  "status": "active",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z",
  "archived_at": null
}
```

---

## GET `/projects`

Список проектов пользователя.

**Query params**
| Param | Тип | Описание |
|-------|-----|---------|
| `kind` | `project_kind` | фильтр по типу |
| `status` | `project_status` | фильтр по статусу |
| `parent_project_id` | uuid | дочерние проекты; передать `null` для корневых |
| `archived` | bool | `false` по умолчанию, не показывать archived |
| `limit` | int | default 50 |
| `offset` | int | default 0 |

**Response 200**
```json
{
  "items": [...],
  "total": 12,
  "limit": 50,
  "offset": 0
}
```

---

## POST `/projects`

Создать проект.

**Body**
```json
{
  "kind": "project",
  "title": "Название",
  "description": "",
  "parent_project_id": null,
  "status": "active"
}
```

**Логика**
- `kind` и `title` — обязательны
- Если передан `parent_project_id` — проверить что проект существует и принадлежит пользователю

**Response 201** — созданный объект.

---

## GET `/projects/{project_id}`

Получить проект.

**Response 200** — объект проекта.  
**Ошибки:** `404`, `403`

---

## PATCH `/projects/{project_id}`

Обновить проект. Все поля опциональны.

**Body**
```json
{
  "title": "Новое название",
  "description": "...",
  "status": "on_hold",
  "kind": "folder",
  "parent_project_id": "uuid"
}
```

**Логика**
- `status = archived` → проставить `archived_at = now()`
- Любой другой статус → обнулить `archived_at`
- `parent_project_id` не может указывать на самого себя или своих потомков

**Response 200** — обновлённый объект.

---

## DELETE `/projects/{project_id}`

Мягкое удаление — архивирование.

**Логика**
1. Проставить `archived_at = now()`, `status = archived`
2. Каскадно то же самое для всех дочерних проектов
3. Каскадно архивировать все notes и tasks внутри

**Response 204**

---

## GET `/projects/{project_id}/notes`

Заметки проекта.

**Query:** `status`, `limit`, `offset`, `archived`  
**Response 200** — paginated список (формат см. [notes.md](notes.md)).

---

## GET `/projects/{project_id}/tasks`

Задачи проекта.

**Query:** `status`, `priority`, `limit`, `offset`, `archived`  
**Response 200** — paginated список (формат см. [tasks.md](tasks.md)).

---

## GET `/projects/{project_id}/files`

Файлы прикреплённые к проекту.

**Response 200** — paginated список файлов.

---

## POST `/projects/{project_id}/files`

Прикрепить существующий файл к проекту.

**Body**
```json
{ "file_id": "uuid" }
```

**Логика**
- Проверить что файл существует
- Создать запись в `project_files`

**Response 201**
```json
{ "id": "uuid", "project_id": "uuid", "file_id": "uuid", "created_at": "..." }
```

**Ошибки:** `409 already_exists`

---

## DELETE `/projects/{project_id}/files/{file_id}`

Открепить файл от проекта. Сам файл не удаляется.

**Response 204**
