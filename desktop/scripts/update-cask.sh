#!/bin/bash
set -e

# Скрипт автоматического обновления Cask-формулы OKAK в репозитории okak-release

VERSION=$1
ARTIFACTS_DIR=$2
GH_TOKEN=$3

if [ -z "$VERSION" ] || [ -z "$ARTIFACTS_DIR" ] || [ -z "$GH_TOKEN" ]; then
  echo "Использование: $0 <version> <artifacts-directory> <github-token>"
  exit 1
fi

echo "Поиск DMG-файлов в директории: $ARTIFACTS_DIR..."
ARM64_DMG=$(find "$ARTIFACTS_DIR" -name "*-arm64.dmg" | head -n 1)
X64_DMG=$(find "$ARTIFACTS_DIR" -name "*-x64.dmg" | head -n 1)

if [ -z "$ARM64_DMG" ]; then
  echo "Ошибка: Файл DMG для архитектуры arm64 не найден в $ARTIFACTS_DIR."
  exit 1
fi

if [ -z "$X64_DMG" ]; then
  # Если x64 не найден, попробуем найти любой другой DMG, отличный от arm64
  X64_DMG=$(find "$ARTIFACTS_DIR" -name "*.dmg" ! -name "*-arm64.dmg" | head -n 1)
fi

if [ -z "$X64_DMG" ]; then
  echo "Предупреждение: Файл DMG для x64 не найден. Будет использован arm64 для обеих архитектур."
  X64_DMG="$ARM64_DMG"
fi

echo "Найдены файлы:"
echo "  Apple Silicon: $ARM64_DMG"
echo "  Intel x64:     $X64_DMG"

echo "Вычисление контрольных сумм SHA256..."
if command -v sha256sum >/dev/null 2>&1; then
  SHA256_ARM64=$(sha256sum "$ARM64_DMG" | awk '{print $1}')
  SHA256_X64=$(sha256sum "$X64_DMG" | awk '{print $1}')
else
  SHA256_ARM64=$(shasum -a 256 "$ARM64_DMG" | awk '{print $1}')
  SHA256_X64=$(shasum -a 256 "$X64_DMG" | awk '{print $1}')
fi

echo "  arm64 SHA256: $SHA256_ARM64"
echo "  x64   SHA256: $SHA256_X64"

echo "Клонирование репозитория Lemon-Corporation/okak-release..."
if ! git clone "https://x-access-token:${GH_TOKEN}@github.com/Lemon-Corporation/okak-release.git" temp-release; then
  echo "========================================================="
  echo "Ошибка: Не удалось склонировать репозиторий 'okak-release'."
  echo "========================================================="
  exit 1
fi

cd temp-release
mkdir -p Casks

echo "Создание/обновление формулы Casks/okak.rb..."
cat <<EOF > Casks/okak.rb
cask "okak" do
  version "$VERSION"

  on_intel do
    sha256 "$SHA256_X64"
    url "https://github.com/Lemon-Corporation/okak-release/releases/download/v#{version}/OKAK-#{version}-x64.dmg"
  end
  on_arm do
    sha256 "$SHA256_ARM64"
    url "https://github.com/Lemon-Corporation/okak-release/releases/download/v#{version}/OKAK-#{version}-arm64.dmg"
  end

  name "OKAK"
  desc "Desktop application for OKAK"
  homepage "https://okakai.ru"

  app "OKAK.app"

  postflight do
    system_command "/usr/bin/xattr",
                   args: ["-d", "com.apple.quarantine", "#{appdir}/OKAK.app"],
                   sudo: false
  rescue
    # Ignore errors if quarantine is not present or command fails
  end

  zap trash: [
    "~/Library/Application Support/OKAK",
    "~/Library/Preferences/com.okak.app.plist",
    "~/Library/Saved Application State/com.okak.app.savedState",
  ]
end
EOF

echo "Коммит изменений..."
git config user.name "GitHub Actions"
git config user.email "actions@github.com"
git add Casks/okak.rb
git commit -m "Update OKAK Cask to v$VERSION" || echo "Нет изменений для коммита"

echo "Отправка в репозиторий..."
git push origin main || git push origin master

echo "Homebrew Cask для версии v$VERSION успешно обновлен в okak-release!"
