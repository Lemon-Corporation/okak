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

## Релизы и Auto-Updater

### Как создать релиз

```bash
# 1. Обнови версию в desktop/package.json
# 2. Закоммить изменения
git add -A
git commit -m "release: v0.1.0"

# 3. Создай тег
git tag v0.1.0

# 4. Пуш — CI соберёт и опубликует
git push origin master
git push origin v0.1.0
```

GitHub Actions автоматически:
- Собирает `.dmg` (macOS) и `.exe` (Windows)
- Публикует в [okak-release](https://github.com/Lemon-Corporation/okak-release/releases) — отдельный публичный репозиторий

**Зачем отдельный репозиторий?**
- Открытый исходный код релизов = доверие пользователей
- Не флагается антивирусами как "неизвестное ПО"
- Чистый разделение: приватный код ↔ публичные сборки

### Как пользователь получает обновления

1. **Первая установка:** скачивает `OKAK-0.1.0.dmg` или `.exe` с сайта/GitHub
2. **Авто-обновление:** при старте приложение проверяет GitHub Releases
3. **Если есть новая версия:** показывает уведомление → скачивает → устанавливает при перезапуске

### Как это работает

```
Приложение стартует
    ↓
autoUpdater.checkForUpdatesAndNotify()
    ↓
Сравнивает package.json version с latest GitHub Release
    ↓
Если v0.1.1 > v0.1.0 → скачивает → уведомляет пользователя
```

**Настройка:** `electron-builder.yml` → `publish: github` (owner: Lemon-Corporation, repo: okak)

## Known Issues

- Файловые сценарии (upload/download) тестировались только в dev-режиме через `localhost`.
- Windows-сборка требует GitHub Actions CI (не собирается локально на macOS).
- macOS-код не подписан (требует Apple Developer ID для нотариуса).
