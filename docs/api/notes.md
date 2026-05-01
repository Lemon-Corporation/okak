# Notes

> Prefix: `/api/v1/notes`  
> Все ендпоинты требуют Bearer токен.  
> Заметка всегда принадлежит проекту, проект — пользователю.

---

## Объект заметки (краткий — в списках)

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "title": "Заголовок",
  "content": "Markdown-текст",
  "status": "draft",
  "created_at": "...",
  "updated_at": "...",
  "archived_at": null,
  "tags": [{ "id": "uuid", "name": "идея", "color": "#ff0000" }]
}
```

## Объект заметки (полный — в GET /{id})

Добавляется поле `files`:
```json
{
  ...как выше...,
  "files": [
    {
      "id": "uuid",
      "original_name": "sketch.png",
      "mime_type": "image/png",
      "size_bytes": 204800,
      "created_at": "..."
    }
  ]
}
```

---

## GET `/notes`

Все заметки пользователя.

**Query params**
| Param | Тип | Описание |
|-------|-----|---------|
| `project_id` | uuid | фильтр по проекту |
| `status` | `note_status` | |
| `tag_id` | uuid | заметки с конкретным тегом |
| `archived` | bool | default false |
| `q` | string | поиск по title и content |
| `limit` | int | default 50 |
| `offset` | int | default 0 |

**Response 200**
```json
{
  "items": [...],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

---

## POST `/notes`

Создать заметку.

**Body**
```json
{
  "project_id": "uuid",
  "title": "Заголовок",
  "content": "",
  "status": "draft"
}
```

**Логика**
- Проверить что `project_id` существует и принадлежит пользователю
- `content` и `title` могут быть пустыми строками

**Response 201** — созданный объект (краткий формат + пустой `tags: []`).

---

## GET `/notes/{note_id}`

Получить заметку с тегами и файлами.

**Response 200** — полный объект.  
**Ошибки:** `404`, `403`

---

## PATCH `/notes/{note_id}`

Обновить заметку. Все поля опциональны.

**Body**
```json
{
  "title": "Новый заголовок",
  "content": "# Привет\nТекст",
  "status": "published"
}
```

**Логика**
- `status = archived` → `archived_at = now()`
- Любой другой статус → `archived_at = null`

**Response 200** — обновлённый объект (полный).

---

## DELETE `/notes/{note_id}`

Мягкое удаление заметки.

**Логика**
1. `archived_at = now()`, `status = archived`
2. Обнулить `linked_note_id` у всех задач где `linked_note_id = note_id`

**Response 204**

---

## POST `/notes/{note_id}/tags`

Прикрепить тег к заметке.

**Body**
```json
{ "tag_id": "uuid" }
```

**Логика**
- Проверить что тег принадлежит пользователю
- Создать запись в `note_tags`

**Response 201**
```json
{ "id": "uuid", "note_id": "uuid", "tag_id": "uuid", "created_at": "..." }
```

**Ошибки:** `409 already_exists`

---

## DELETE `/notes/{note_id}/tags/{tag_id}`

Открепить тег от заметки.

**Response 204**

---

## POST `/notes/{note_id}/files`

Прикрепить уже загруженный файл к заметке.

**Body**
```json
{ "file_id": "uuid" }
```

**Логика**
- Файл должен существовать (загружен через `POST /files/upload`)
- Создать запись в `note_files`

**Response 201**
```json
{ "id": "uuid", "note_id": "uuid", "file_id": "uuid", "created_at": "..." }
```

**Ошибки:** `409 already_exists`

---

## DELETE `/notes/{note_id}/files/{file_id}`

Открепить файл от заметки. Сам файл не удаляется.

**Response 204**
