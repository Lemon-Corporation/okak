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

### Локально (macOS)

```bash
cd desktop
pnpm build:app
```

Создаёт `desktop/release/OKAK-0.1.0.dmg` (~105 MB).

### CI/CD (macOS + Windows)

GitHub Actions собирает автоматически на каждый push тега `v*`:

- **macOS:** `.dmg` — скачать, открыть, перетащить OKAK.app в Applications
- **Windows:** `.exe` — скачать, запустить установщик

Артефакты доступны в разделе Actions → Build Desktop Apps.

### Архитектура production

```
Electron main
    ↓
spawn(child_process) → Next.js standalone server (localhost:3000)
    ↓
BrowserWindow.loadURL(http://localhost:3000)
```

Приложение содержит встроенный Node.js сервер — не требует интернета или внешнего backend.

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

- Файловые сценарии (upload/download) тестировались только в dev-режиме через `localhost`.
- Windows-сборка требует GitHub Actions CI (не собирается локально на macOS).
- macOS-код не подписан (требует Apple Developer ID для нотариуса).
