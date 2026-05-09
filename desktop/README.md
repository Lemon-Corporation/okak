# ОКАК Desktop

Desktop-оболочка приложения ОКАК на Electron.

## Архитектура

```
desktop/
├── src/
│   ├── main.ts      — главный процесс Electron (окно, меню, IPC)
│   ├── preload.ts   — безопасный preload-скрипт (contextBridge)
│   ├── config.ts    — конфигурация окружения (API URL, dev/prod)
│   └── types.ts     — TypeScript-типы для IPC
├── assets/          — иконки приложения
├── dist/            — скомпилированные JS-файлы (tsc)
├── package.json     — зависимости и скрипты
└── tsconfig.json    — конфигурация TypeScript
```

**Безопасность**
- `contextIsolation: true` — preload изолирован от renderer
- `nodeIntegration: false` — renderer не имеет доступа к Node.js
- `sandbox: true` — renderer работает в песочнице
- Внешние ссылки открываются в системном браузере

## Dev-режим

```bash
cd desktop
pnpm dev
```

Запускает одновременно:
1. `next dev` в `frontend/` (http://localhost:3000)
2. Electron, загружающий http://localhost:3000

Требования:
- Node.js 20+
- pnpm
- Зависимости установлены (`pnpm install` из корня репозитория)

## Production-сборка

```bash
cd desktop
pnpm build:app
```

Создаёт пакеты в `desktop/release/`.

**Блокер:** production-build требует static-export Next.js (`output: 'export'`) или встроенного сервера frontend. Сейчас dev-режим покрывает MVP-сценарий.

## Конфигурация

| Переменная | Описание | По умолчанию |
|-----------|----------|-------------|
| `NODE_ENV` | `development` или `production` | — |
| `API_URL` | URL backend API | `http://localhost:8000` (dev), `https://api.okak.app` (prod) |

Передача в Electron:
```bash
API_URL=http://localhost:8000 pnpm dev
```

## Функции

- **Tray иконка** — приложение сворачивается в трей, клик показывает/скрывает окно
- **Нативные уведомления** — IPC `app:notify` для отправки системных уведомлений
- **Глобальные hotkeys** — `Cmd/Ctrl+Shift+O` показать/скрыть окно
- **Retry загрузки** — в dev-режиме Electron ждёт до 30 секунд пока поднимется Next.js сервер
- **macOS-style** — закрытие окна сворачивает в dock, не выходит из приложения

## IPC API

| Канал | Направление | Описание |
|-------|------------|----------|
| `app:version` | main → renderer | Версия приложения |
| `app:get-config` | main → renderer | Конфиг (`apiUrl`, `isDev`) |
| `app:notify` | renderer → main | Нативное уведомление (`title`, `body`) |

## Known Issues

- Production static export не настроен (требует `generateStaticParams` для `[id]` роутов).
- Файловые сценарии (upload/download) тестировались только в dev-режиме через `localhost`.
