# Схема базы данных

## Enum-типы

```sql
project_kind    : workspace | project | folder
project_status  : active | on_hold | completed | archived
note_status     : draft | published | archived
task_status     : backlog | todo | in_progress | done | cancelled
task_priority   : none | low | medium | high | urgent
file_source     : upload | generated
```

> `link` убран — на стартапе файлы только загружаются с устройства пользователя.

---

## Таблицы

### users
| Колонка | Тип | Ограничения |
|---------|-----|------------|
| id | uuid | PK |
| email | varchar(255) | NN, UNIQUE |
| display_name | varchar(255) | NN |
| hashed_password | varchar | NN |
| created_at | timestamptz | NN, default now() |
| updated_at | timestamptz | NN, default now() |

---

### projects
| Колонка | Тип | Ограничения |
|---------|-----|------------|
| id | uuid | PK |
| owner_user_id | uuid | FK → users.id CASCADE |
| parent_project_id | uuid | FK → projects.id SET NULL, nullable |
| kind | project_kind | NN |
| title | varchar(255) | NN |
| description | text | |
| status | project_status | NN, default active |
| created_at | timestamptz | NN |
| updated_at | timestamptz | NN |
| archived_at | timestamptz | nullable |

Индексы: `owner_user_id`, `parent_project_id`, `status`

---

### notes
| Колонка | Тип | Ограничения |
|---------|-----|------------|
| id | uuid | PK |
| project_id | uuid | FK → projects.id CASCADE, NN |
| title | varchar(255) | NN |
| content | text | |
| status | note_status | NN, default draft |
| created_at | timestamptz | NN |
| updated_at | timestamptz | NN |
| archived_at | timestamptz | nullable |

Индексы: `project_id`, `status`  
Полнотекстовый индекс: `tsvector(title, content)` для поиска.

---

### tasks
| Колонка | Тип | Ограничения |
|---------|-----|------------|
| id | uuid | PK |
| project_id | uuid | FK → projects.id CASCADE, NN |
| linked_note_id | uuid | FK → notes.id SET NULL, nullable |
| title | varchar(255) | NN |
| description | text | |
| status | task_status | NN, default backlog |
| priority | task_priority | NN, default none |
| due_at | timestamptz | nullable |
| created_at | timestamptz | NN |
| updated_at | timestamptz | NN |
| completed_at | timestamptz | nullable |
| archived_at | timestamptz | nullable |

Индексы: `project_id`, `status`, `priority`, `due_at`

---

### files
| Колонка | Тип | Ограничения |
|---------|-----|------------|
| id | uuid | PK |
| project_id | uuid | FK → projects.id CASCADE, NN |
| original_name | varchar(500) | NN |
| storage_key | varchar(1000) | NN, UNIQUE |
| mime_type | varchar(255) | |
| extension | varchar(50) | |
| size_bytes | bigint | NN |
| checksum_sha256 | varchar(64) | |
| source | file_source | NN, default upload |
| created_at | timestamptz | NN |
| updated_at | timestamptz | NN |

> `storage_key` — относительный путь от `UPLOADS_DIR`, например `2026/05/abc123.pdf`

---

### tags
| Колонка | Тип | Ограничения |
|---------|-----|------------|
| id | uuid | PK |
| owner_user_id | uuid | FK → users.id CASCADE, NN |
| name | varchar(100) | NN |
| color | varchar(20) | NN |
| created_at | timestamptz | NN |

UNIQUE: `(owner_user_id, name)`

---

## Junction-таблицы

### project_files
`(id, project_id → projects, file_id → files, created_at)`  
UNIQUE: `(project_id, file_id)`

### note_files
`(id, note_id → notes, file_id → files, created_at)`  
UNIQUE: `(note_id, file_id)`

### note_tags
`(id, note_id → notes, tag_id → tags, created_at)`  
UNIQUE: `(note_id, tag_id)`

### task_files
`(id, task_id → tasks, file_id → files, created_at)`  
UNIQUE: `(task_id, file_id)`

---

## Связи (граф)

```
users ──< projects ──< notes ──< note_tags >── tags
                  │         └──< note_files >──┐
                  │                             │
                  └──< tasks ──< task_files >───┤
                  │                             │
                  └──< files ──────────────────<┘
                            └──< project_files
```
