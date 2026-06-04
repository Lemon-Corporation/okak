#!/bin/bash

# Скрипт автоматической установки OKAK для macOS без блокировки Gatekeeper.
# Данный скрипт скачивает релиз через curl, что обходит присвоение атрибута карантина.

set -e

echo "=== Установка OKAK для macOS ==="

# 1. Проверяем архитектуру системы
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
  echo "[1/6] Архитектура: Apple Silicon ($ARCH)"
else
  echo "[1/6] Архитектура: Intel ($ARCH)"
fi

# 2. Получаем ссылку на последний релиз с GitHub API
echo "[2/6] Получение информации о последнем релизе..."
RELEASE_JSON=$(curl -s https://api.github.com/repos/Lemon-Corporation/okak-release/releases/latest)
TAG_NAME=$(echo "$RELEASE_JSON" | grep -o '"tag_name": "[^"]*' | grep -o '[^"]*$' | head -n 1)

if [ -z "$TAG_NAME" ]; then
  echo "Ошибка: Не удалось получить имя тега релиза с GitHub."
  exit 1
fi

echo "Найдена последняя версия: $TAG_NAME"

DOWNLOAD_URL=$(echo "$RELEASE_JSON" | grep -o '"browser_download_url": "[^"]*' | grep -o '[^"]*$' | grep '\.dmg$' | head -n 1)

if [ -z "$DOWNLOAD_URL" ]; then
  echo "Ошибка: Не найден .dmg файл в последнем релизе."
  exit 1
fi

# 3. Скачиваем DMG-образ во временную директорию
TEMP_DIR=$(mktemp -d)
DMG_PATH="$TEMP_DIR/OKAK-$TAG_NAME.dmg"

echo "[3/6] Скачивание DMG из $DOWNLOAD_URL..."
curl -L "$DOWNLOAD_URL" -o "$DMG_PATH"

# 4. Монтируем DMG-образ
echo "[4/6] Монтирование DMG..."
MOUNT_POINT="$TEMP_DIR/mount"
mkdir -p "$MOUNT_POINT"
hdiutil attach "$DMG_PATH" -mountpoint "$MOUNT_POINT" -nobrowse -quiet

# 5. Копируем приложение в директорию Программы (/Applications)
echo "[5/6] Копирование OKAK.app в /Applications..."
if [ -d "/Applications/OKAK.app" ]; then
  echo "Обнаружена старая версия OKAK.app. Удаление..."
  rm -rf "/Applications/OKAK.app"
fi

cp -R "$MOUNT_POINT/OKAK.app" "/Applications/"

# 6. Размонтируем образ и очищаем временные файлы
echo "[6/6] Очистка временных файлов..."
hdiutil detach "$MOUNT_POINT" -quiet
rm -rf "$TEMP_DIR"

# Сбрасываем атрибуты карантина (на всякий случай)
echo "Сброс атрибутов карантина..."
xattr -cr "/Applications/OKAK.app" 2>/dev/null || true

echo "=========================================="
echo "Установка успешно завершена!"
echo "Приложение OKAK скопировано в /Applications/OKAK.app"
echo "Вы можете запустить его из Launchpad или папки Программы."
echo "=========================================="
