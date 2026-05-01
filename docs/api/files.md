# Files

> Prefix: `/api/v1/files`  
> Все ендпоинты требуют Bearer токен.

## Хранение (стартап-фаза)

Файлы хранятся на диске сервера.  
Путь настраивается через переменную окружения `UPLOADS_DIR` (default: `./uploads`).  
Структура папок: `{UPLOADS_DIR}/{year}/{month}/{uuid}.{ext}`

```
backend/
└── uploads/
    └── 2026/
        └── 05/
            ├── a1b2c3d4.pdf
            └── e5f6g7h8.png
```

В БД в колонке `storage_key` хранится относительный путь от `UPLOADS_DIR`: `2026/05/a1b2c3d4.pdf`.

---

## Объект файла

```json
{
  "id": "uuid",
  "original_name": "document.pdf",
  "storage_key": "2026/05/a1b2c3d4.pdf",
  "mime_type": "application/pdf",
  "extension": "pdf",
  "size_bytes": 204800,
  "checksum_sha256": "abc123...",
  "source": "upload",
  "created_at": "...",
  "updated_at": "..."
}
```

---

## POST `/files/upload`

Загрузить файл на сервер.

**Content-Type:** `multipart/form-data`

| Field | Тип | Описание |
|-------|-----|---------|
| `file` | binary | файл (обязательно) |
| `project_id` | uuid | к какому проекту относится (обязательно) |

**Логика**
1. Проверить `project_id` принадлежит пользователю
2. Проверить размер файла (max `MAX_FILE_SIZE_MB` из `.env`, default 50 MB)
3. Вычислить `checksum_sha256` — если такой файл уже есть в этом проекте → вернуть существующий (дедупликация)
4. Сгенерировать `uuid` для имени файла
5. Сохранить на диск: `{UPLOADS_DIR}/{year}/{month}/{uuid}.{ext}`
6. Записать метаданные в таблицу `files`
7. Создать запись в `project_files`

**Response 201** — объект файла.

**Ошибки**
| Код | code | Причина |
|-----|------|---------|
| 400 | `file_too_large` | превышен лимит размера |
| 400 | `invalid_mime_type` | тип файла не разрешён |
| 404 | `not_found` | project_id не найден |

---

## GET `/files/{file_id}`

Метаданные файла.

**Response 200** — объект файла.  
**Ошибки:** `404`, `403`

---

## GET `/files/{file_id}/download`

Скачать файл напрямую.

**Response 200** — бинарный файл с заголовками:
```
Content-Type: <mime_type>
Content-Disposition: attachment; filename="original_name.pdf"
Content-Length: <size_bytes>
```

**Логика:** прочитать файл из `{UPLOADS_DIR}/{storage_key}` и отдать через `FileResponse` (FastAPI).  
**Ошибки:** `404` если файл не найден в БД или на диске.

---

## DELETE `/files/{file_id}`

Полностью удалить файл.

**Логика**
1. Удалить файл с диска (`{UPLOADS_DIR}/{storage_key}`)
2. Удалить записи в `project_files`, `note_files`, `task_files`
3. Удалить запись в `files`

**Response 204**

---

## Разрешённые типы файлов

Настраивается в `core/config.py`. По умолчанию:

| Категория | MIME-типы |
|-----------|----------|
| Изображения | `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml` |
| Документы | `application/pdf`, `text/plain`, `text/markdown` |
| Office | `application/msword`, `application/vnd.openxmlformats-officedocument.*` |
| Архивы | `application/zip` |

Всё остальное → `400 invalid_mime_type`.
