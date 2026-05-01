# Search

> Prefix: `/api/v1/search`  
> Требует Bearer токен.  
> Поиск только по данным текущего пользователя.

---

## GET `/search`

Полнотекстовый поиск по заметкам, задачам и проектам.

**Query params**
| Param | Тип | Обязательный | Описание |
|-------|-----|-------------|---------|
| `q` | string | да | поисковый запрос, min 2 символа |
| `kind` | `note\|task\|project` | нет | ограничить тип, default — все |
| `limit` | int | нет | max результатов на тип, default 10 |

**Response 200**
```json
{
  "notes": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "title": "Заметка о...",
      "content_excerpt": "...совпадающий <mark>фрагмент</mark> текста...",
      "status": "published",
      "updated_at": "..."
    }
  ],
  "tasks": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "title": "Задача с совпадением",
      "status": "todo",
      "priority": "high",
      "updated_at": "..."
    }
  ],
  "projects": [
    {
      "id": "uuid",
      "kind": "project",
      "title": "Проект с совпадением",
      "status": "active",
      "updated_at": "..."
    }
  ]
}
```

**Логика**
1. Нормализовать запрос (trim, убрать спецсимволы)
2. Выполнить поиск через PostgreSQL `tsvector`/`tsquery`:
   - `notes`: по `title` + `content`
   - `tasks`: по `title` + `description`  
   - `projects`: по `title` + `description`
3. Фильтровать archived записи (где `archived_at IS NOT NULL`)
4. Ранжировать по `ts_rank`
5. Вернуть max `limit` результатов на каждый тип

**Пример SQL для notes:**
```sql
SELECT id, project_id, title,
       ts_headline('russian', content, query, 'MaxWords=15,MinWords=5') as content_excerpt,
       status, updated_at,
       ts_rank(to_tsvector('russian', title || ' ' || content), query) as rank
FROM notes, to_tsquery('russian', :q) query
JOIN projects ON notes.project_id = projects.id
WHERE projects.owner_user_id = :user_id
  AND archived_at IS NULL
  AND to_tsvector('russian', title || ' ' || content) @@ query
ORDER BY rank DESC
LIMIT :limit
```

**Ошибки:** `400` если `q` короче 2 символов.

---

## Индексы для поиска

В Alembic-миграции добавить:

```sql
-- notes
CREATE INDEX notes_fts_idx ON notes
  USING gin(to_tsvector('russian', title || ' ' || coalesce(content, '')));

-- tasks
CREATE INDEX tasks_fts_idx ON tasks
  USING gin(to_tsvector('russian', title || ' ' || coalesce(description, '')));

-- projects
CREATE INDEX projects_fts_idx ON projects
  USING gin(to_tsvector('russian', title || ' ' || coalesce(description, '')));
```
