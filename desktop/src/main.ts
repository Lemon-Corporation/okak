import {
  app,
  BrowserWindow,
  Menu,
  shell,
  ipcMain,
  nativeImage,
  Tray,
  Notification,
  globalShortcut,
  dialog,
  nativeTheme,
  powerSaveBlocker,
  powerMonitor,
  clipboard,
  screen,
  type MenuItemConstructorOptions,
  type HandlerDetails,
} from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import { spawn, type ChildProcess } from 'child_process'
import log from 'electron-log'
import Store from 'electron-store'
import { config } from './config'

const isDev = !app.isPackaged

// Window state persistence
const windowStore = new Store<{ bounds: { width: number; height: number; x?: number; y?: number } }>({
  name: 'window-state',
  defaults: {
    bounds: { width: 1400, height: 900 },
  },
})

if (isDev) {
  try {
    require('electron-reloader')(module, {})
  } catch {
    // ignore
  }
}

let mainWindow: BrowserWindow | null = null
let overlayWindow: BrowserWindow | null = null
let tray: Tray | null = null
let serverProcess: ChildProcess | null = null

// Auto-updater
if (!isDev) {
  autoUpdater.checkForUpdatesAndNotify()
  autoUpdater.on('update-available', () => {
    log.info('[updater] update available')
  })
  autoUpdater.on('update-downloaded', () => {
    log.info('[updater] update downloaded, will install on quit')
  })
}

// Deep link protocol
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('okak', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('okak')
}

// Crash handler
process.on('uncaughtException', (error) => {
  log.error('[crash] uncaughtException:', error)
})
process.on('unhandledRejection', (reason) => {
  log.error('[crash] unhandledRejection:', reason)
})

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
  process.exit(0)
}

app.on('second-instance', () => {
  log.info('[app] second instance detected, focusing window')
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  }
})

function getIcon(): Electron.NativeImage | undefined {
  const iconPath = path.join(__dirname, '..', 'assets', 'icon.png')
  try {
    return nativeImage.createFromPath(iconPath)
  } catch {
    return undefined
  }
}

function createWindow(): void {
  const savedBounds = (windowStore as any).get('bounds') as { width: number; height: number; x?: number; y?: number }

  mainWindow = new BrowserWindow({
    width: savedBounds.width,
    height: savedBounds.height,
    x: savedBounds.x,
    y: savedBounds.y,
    minWidth: 900,
    minHeight: 600,
    title: 'OKAK',
    icon: getIcon(),
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 20, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      spellcheck: true,
    },
  })

  // Load app with retry for dev mode
  if (isDev) {
    const devUrl = 'http://localhost:3000/login'
    let attempts = 0
    const maxAttempts = 30

    const tryLoad = () => {
      attempts++
      mainWindow!.loadURL(devUrl).catch(() => {
        if (attempts < maxAttempts) {
          log.info(`[dev] waiting for ${devUrl}, attempt ${attempts}/${maxAttempts}`)
          setTimeout(tryLoad, 1000)
        } else {
          log.error(`[dev] failed to connect to ${devUrl} after ${maxAttempts} attempts`)
        }
      })
    }
    tryLoad()
    mainWindow.webContents.openDevTools()
  } else {
    // Production: start standalone Next.js server from extraResources
    const resourcesPath = process.resourcesPath
    const serverPath = path.join(resourcesPath, 'frontend', '.next', 'standalone', 'frontend', 'server.js')
    const port = process.env.PORT || '3000'
    const prodUrl = `http://localhost:${port}/login`

    log.info('[prod] starting standalone server:', serverPath)
    serverProcess = spawn(process.execPath, [serverPath], {
      env: { ...process.env, PORT: port },
      cwd: path.dirname(serverPath),
      stdio: 'pipe',
    })

    serverProcess.stdout?.on('data', (data) => {
      log.info('[server]', data.toString().trim())
    })
    serverProcess.stderr?.on('data', (data) => {
      log.error('[server]', data.toString().trim())
    })

    let attempts = 0
    const maxAttempts = 30
    const tryLoad = () => {
      attempts++
      mainWindow!.loadURL(prodUrl).catch(() => {
        if (attempts < maxAttempts) {
          log.info(`[prod] waiting for ${prodUrl}, attempt ${attempts}/${maxAttempts}`)
          setTimeout(tryLoad, 1000)
        } else {
          log.error(`[prod] failed to connect to ${prodUrl} after ${maxAttempts} attempts`)
        }
      })
    }
    tryLoad()
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler((details: HandlerDetails) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Native context menu on right-click
  mainWindow.webContents.on('context-menu', (_event, params) => {
    const menu = Menu.buildFromTemplate([
      {
        label: 'Назад',
        enabled: mainWindow!.webContents.canGoBack(),
        click: () => mainWindow!.webContents.goBack(),
      },
      {
        label: 'Вперёд',
        enabled: mainWindow!.webContents.canGoForward(),
        click: () => mainWindow!.webContents.goForward(),
      },
      { type: 'separator' },
      {
        label: 'Обновить',
        click: () => mainWindow!.webContents.reload(),
      },
      { type: 'separator' },
      {
        label: 'Вырезать',
        role: 'cut',
        visible: params.isEditable,
      },
      {
        label: 'Копировать',
        role: 'copy',
        visible: params.selectionText.length > 0,
      },
      {
        label: 'Вставить',
        role: 'paste',
        visible: params.isEditable,
      },
      {
        label: 'Выделить всё',
        role: 'selectAll',
      },
    ])
    menu.popup()
  })

  // Handle file drag & drop
  mainWindow.webContents.on('dom-ready', () => {
    mainWindow?.webContents.executeJavaScript(`
      document.addEventListener('dragover', (e) => { e.preventDefault(); return false; })
      document.addEventListener('drop', (e) => {
        e.preventDefault()
        return false
      })
    `)
  })

  // Save window state on resize/move
  const saveBounds = () => {
    if (mainWindow) {
      const bounds = mainWindow.getNormalBounds()
      ;(windowStore as any).set('bounds', bounds)
    }
  }
  mainWindow.on('resize', saveBounds)
  mainWindow.on('move', saveBounds)

  // Hide instead of close (macOS behavior)
  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin') {
      event.preventDefault()
      saveBounds()
      mainWindow?.hide()
      // Show overlay when main window is hidden
      if (!overlayWindow) createOverlayWindow()
      overlayWindow?.show()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Notify renderer about maximize state changes
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('app:window-maximized', true)
  })
  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('app:window-maximized', false)
  })

  // Find in page results
  mainWindow.webContents.on('found-in-page', (_event, result) => {
    mainWindow?.webContents.send('app:found-in-page', result)
  })

  // Context menu for spellcheck
  mainWindow.webContents.on('context-menu', (_event, params) => {
    if (params.misspelledWord && params.misspelledWord.length > 0) {
      const suggestions = params.dictionarySuggestions
      const spellMenu = Menu.buildFromTemplate([
        ...(suggestions.length > 0
          ? suggestions.map((s: string) => ({
              label: s,
              click: () => mainWindow?.webContents.replaceMisspelling(s),
            }))
          : [{ label: 'Нет предложений', enabled: false }]),
        { type: 'separator' },
        {
          label: 'Добавить в словарь',
          click: () => mainWindow?.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord),
        },
      ])
      spellMenu.popup()
    }
  })
}

function createOverlayWindow(): void {
  log.info('[overlay] creating overlay window')
  const width = 380
  const height = 500
  const margin = 20

  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth } = primaryDisplay.workAreaSize

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: screenWidth - width - margin,
    y: margin,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    resizable: true,
    movable: true,
    minimizable: false,
    maximizable: false,
    transparent: true,
    hasShadow: true,
    roundedCorners: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  const overlayUrl = isDev
    ? 'http://localhost:3000/overlay'
    : `http://localhost:${process.env.PORT || '3000'}/overlay`

  log.info('[overlay] loading URL:', overlayUrl)
  overlayWindow.loadURL(overlayUrl).catch((err) => {
    log.error('[overlay] failed to load:', err)
  })

  overlayWindow.on('ready-to-show', () => {
    log.info('[overlay] ready to show')
  })

  overlayWindow.on('closed', () => {
    log.info('[overlay] closed')
    overlayWindow = null
  })
}

function toggleOverlay(): void {
  log.info('[overlay] toggleOverlay called, overlayWindow exists:', !!overlayWindow)
  if (!overlayWindow) {
    createOverlayWindow()
  }
  if (overlayWindow) {
    if (overlayWindow.isVisible()) {
      log.info('[overlay] hiding')
      overlayWindow.hide()
    } else {
      log.info('[overlay] showing')
      overlayWindow.show()
      overlayWindow.focus()
    }
  }
}

function createTray(): void {
  const icon = getIcon()
  if (!icon) {
    log.warn('[tray] icon not found, skipping tray creation')
    return
  }

  tray = new Tray(icon)
  tray.setToolTip('ОКАК')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Показать ОКАК',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        } else {
          createWindow()
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Выход',
      click: () => {
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    } else {
      createWindow()
    }
  })
}

function buildMenu(): Menu {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'ОКАК',
      submenu: [
        {
          label: 'О приложении',
          role: 'about',
        },
        { type: 'separator' },
        {
          label: 'Скрыть',
          role: 'hide',
          accelerator: 'Command+H',
        },
        {
          label: 'Выход',
          role: 'quit',
          accelerator: 'CmdOrCtrl+Q',
        },
      ],
    },
    {
      label: 'Правка',
      submenu: [
        { role: 'undo', label: 'Отменить' },
        { role: 'redo', label: 'Повторить' },
        { type: 'separator' },
        { role: 'cut', label: 'Вырезать' },
        { role: 'copy', label: 'Копировать' },
        { role: 'paste', label: 'Вставить' },
        { role: 'selectAll', label: 'Выделить все' },
      ],
    },
    {
      label: 'Вид',
      submenu: [
        {
          label: 'Перезагрузить',
          role: 'reload',
          accelerator: 'CmdOrCtrl+R',
        },
        {
          label: 'Открыть DevTools',
          role: 'toggleDevTools',
          accelerator: isDev ? 'F12' : undefined,
          visible: isDev,
        },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Сбросить масштаб' },
        { role: 'zoomIn', label: 'Увеличить' },
        { role: 'zoomOut', label: 'Уменьшить' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Полноэкранный режим' },
      ],
    },
    {
      label: 'Окно',
      submenu: [
        { role: 'minimize', label: 'Свернуть' },
        { role: 'close', label: 'Закрыть' },
      ],
    },
  ]

  return Menu.buildFromTemplate(template)
}

// IPC handlers
ipcMain.handle('app:version', () => app.getVersion())
ipcMain.handle('app:get-config', () => config)

ipcMain.handle('app:notify', (_event, { title, body }: { title: string; body: string }) => {
  if (!Notification.isSupported()) return false
  const notification = new Notification({
    title,
    body,
    icon: getIcon(),
  })
  notification.show()
  return true
})

// Native file dialog
ipcMain.handle('app:open-file', async () => {
  if (!mainWindow) return null
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
  })
  return result.canceled ? null : result.filePaths
})

// Check backend connectivity
ipcMain.handle('app:check-online', async () => {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(`${config.apiUrl}/health`, { signal: controller.signal })
    clearTimeout(timeout)
    return response.ok
  } catch {
    return false
  }
})

// Progress bar on taskbar / dock
ipcMain.handle('app:set-progress-bar', (_event, value: number) => {
  if (mainWindow) {
    // value: -1 = remove, 0-1 = progress
    mainWindow.setProgressBar(value === -1 ? -1 : value)
  }
})

// Badge counter on dock / taskbar
ipcMain.handle('app:set-badge', (_event, count: number) => {
  if (process.platform === 'darwin') {
    app.setBadgeCount(count)
  } else if (mainWindow) {
    // Windows overlay icon or badge
    if (count > 0) {
      // Simple approach: set overlay icon (or use overlay badge)
      // For now, just log it
      log.info('[badge] set badge count:', count)
    }
  }
})

// Auto-launch on system startup
ipcMain.handle('app:set-auto-launch', (_event, enable: boolean) => {
  app.setLoginItemSettings({
    openAtLogin: enable,
    openAsHidden: false,
  })
  return enable
})

ipcMain.handle('app:get-auto-launch', () => {
  return app.getLoginItemSettings().openAtLogin
})

// Zoom controls
ipcMain.handle('app:zoom-in', () => {
  if (mainWindow) {
    const current = mainWindow.webContents.getZoomLevel()
    mainWindow.webContents.setZoomLevel(current + 0.5)
  }
})

ipcMain.handle('app:zoom-out', () => {
  if (mainWindow) {
    const current = mainWindow.webContents.getZoomLevel()
    mainWindow.webContents.setZoomLevel(current - 0.5)
  }
})

ipcMain.handle('app:zoom-reset', () => {
  if (mainWindow) {
    mainWindow.webContents.setZoomLevel(0)
  }
})

// Print
ipcMain.handle('app:print', () => {
  if (mainWindow) {
    mainWindow.webContents.print({ silent: false, printBackground: true })
  }
})

// Window controls (for frameless window)
ipcMain.handle('app:minimize', () => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.handle('app:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.handle('app:is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false
})

ipcMain.handle('app:close', () => {
  if (mainWindow) mainWindow.close()
})

// Fullscreen toggle
ipcMain.handle('app:toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen())
  }
})

// Dark mode
ipcMain.handle('app:get-dark-mode', () => nativeTheme.shouldUseDarkColors)

ipcMain.handle('app:set-dark-mode', (_event, enable: boolean) => {
  nativeTheme.themeSource = enable ? 'dark' : 'light'
})

nativeTheme.on('updated', () => {
  if (mainWindow) {
    mainWindow.webContents.send('app:dark-mode-changed', nativeTheme.shouldUseDarkColors)
  }
})

// Offline mode: API cache + mutation queue
const offlineStore = new Store<{
  cache: Record<string, { data: unknown; timestamp: number; ttl: number }>
  queue: { id: string; method: string; url: string; body: unknown; headers: Record<string, string> }[]
}>({
  name: 'offline-data',
  defaults: { cache: {}, queue: [] },
})

let isOffline = false

function setOfflineStatus(offline: boolean): void {
  if (isOffline === offline) return
  isOffline = offline
  log.info('[offline] status changed:', offline ? 'OFFLINE' : 'ONLINE')
  if (mainWindow) {
    mainWindow.webContents.send('app:offline-changed', offline)
  }
  if (!offline) {
    // Back online — try to sync queued mutations
    syncQueuedMutations()
  }
}

async function syncQueuedMutations(): Promise<void> {
  const queue: { id: string; method: string; url: string; body: unknown; headers: Record<string, string> }[] =
    (offlineStore as any).get('queue') || []
  if (queue.length === 0) return

  log.info(`[offline] syncing ${queue.length} queued mutations`)
  const failed: typeof queue = []

  for (const item of queue) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: { 'Content-Type': 'application/json', ...item.headers },
        body: item.body ? JSON.stringify(item.body) : undefined,
      })
      if (!response.ok) {
        failed.push(item)
      }
    } catch {
      failed.push(item)
    }
  }

  ;(offlineStore as any).set('queue', failed)
  if (failed.length > 0) {
    log.warn(`[offline] ${failed.length} mutations failed to sync`)
  } else {
    log.info('[offline] all mutations synced successfully')
  }

  if (mainWindow) {
    mainWindow.webContents.send('app:sync-complete', failed.length === 0)
  }
}

// Check connectivity periodically
function startConnectivityCheck(): void {
  setInterval(async () => {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(`${config.apiUrl}/health`, { signal: controller.signal })
      clearTimeout(timeout)
      setOfflineStatus(!response.ok)
    } catch {
      setOfflineStatus(true)
    }
  }, 30000) // Check every 30 seconds
}

// IPC handlers for offline mode
ipcMain.handle('app:api-request', async (_event, { method, url, body, headers, cacheKey, ttl }: {
  method: string
  url: string
  body?: unknown
  headers?: Record<string, string>
  cacheKey?: string
  ttl?: number
}) => {
  const key = cacheKey || `${method}:${url}`

  // If offline and GET — return cached data
  if (isOffline && method === 'GET') {
    const cached = (offlineStore as any).get(`cache.${key}`) as { data: unknown; timestamp: number; ttl: number } | undefined
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      log.info('[offline] serving cached:', key)
      return { success: true, data: cached.data, fromCache: true }
    }
    return { success: false, error: 'Offline and no cache available', fromCache: false }
  }

  // If offline and mutation — queue it
  if (isOffline && method !== 'GET') {
    const queue: { id: string; method: string; url: string; body: unknown; headers: Record<string, string> }[] =
      (offlineStore as any).get('queue') || []
    queue.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      method,
      url,
      body,
      headers: headers || {},
    })
    ;(offlineStore as any).set('queue', queue)
    log.info('[offline] queued mutation:', method, url)
    return { success: true, queued: true }
  }

  // Online — make request normally
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...(headers || {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await response.json().catch(() => null)

    // Cache GET responses
    if (method === 'GET' && cacheKey) {
      ;(offlineStore as any).set(`cache.${key}`, {
        data,
        timestamp: Date.now(),
        ttl: (ttl || 300) * 1000, // default 5 min
      })
    }

    return { success: response.ok, data, status: response.status }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('app:get-offline-status', () => isOffline)

ipcMain.handle('app:get-sync-queue', () => {
  return (offlineStore as any).get('queue') as { id: string; method: string; url: string; body: unknown }[]
})

ipcMain.handle('app:trigger-sync', async () => {
  await syncQueuedMutations()
})

// Power save blocker (prevent sleep during operations)
let powerBlockerId: number | null = null

ipcMain.handle('app:block-sleep', () => {
  if (powerBlockerId !== null) return true
  powerBlockerId = powerSaveBlocker.start('prevent-display-sleep')
  log.info('[power] sleep blocked, id:', powerBlockerId)
  return true
})

ipcMain.handle('app:unblock-sleep', () => {
  if (powerBlockerId === null) return false
  powerSaveBlocker.stop(powerBlockerId)
  log.info('[power] sleep unblocked, id:', powerBlockerId)
  powerBlockerId = null
  return true
})

ipcMain.handle('app:is-sleep-blocked', () => {
  return powerBlockerId !== null && powerSaveBlocker.isStarted(powerBlockerId)
})

// Idle detection
ipcMain.handle('app:get-idle-time', () => {
  return powerMonitor.getSystemIdleTime()
})

ipcMain.handle('app:get-idle-state', (_event, threshold: number) => {
  return powerMonitor.getSystemIdleState(threshold)
})

// Clipboard
ipcMain.handle('app:clipboard-read', () => {
  return {
    text: clipboard.readText(),
    html: clipboard.readHTML(),
    rtf: clipboard.readRTF(),
  }
})

ipcMain.handle('app:clipboard-write', (_event, text: string) => {
  clipboard.writeText(text)
})

// Overlay
ipcMain.handle('app:show-overlay', () => {
  if (!overlayWindow) createOverlayWindow()
  overlayWindow?.show()
  overlayWindow?.focus()
})

ipcMain.handle('app:hide-overlay', () => {
  overlayWindow?.hide()
})

ipcMain.handle('app:toggle-overlay', () => {
  toggleOverlay()
})

ipcMain.handle('app:is-overlay-visible', () => {
  return overlayWindow?.isVisible() || false
})

// Find in page
ipcMain.handle('app:find-in-page', (_event, text: string) => {
  if (mainWindow) {
    mainWindow.webContents.findInPage(text)
  }
})

ipcMain.handle('app:stop-find', () => {
  if (mainWindow) {
    mainWindow.webContents.stopFindInPage('clearSelection')
  }
})

// Session restore
const sessionStore = new Store<{ session: { path: string; title: string }[] }>({
  name: 'session',
  defaults: { session: [] },
})

ipcMain.handle('app:save-session', (_event, sessionData: { path: string; title: string }[]) => {
  ;(sessionStore as any).set('session', sessionData)
})

ipcMain.handle('app:get-session', () => {
  return (sessionStore as any).get('session') as { path: string; title: string }[]
})

ipcMain.handle('app:clear-session', () => {
  ;(sessionStore as any).set('session', [])
})

// Recent documents (macOS Dock + Windows Jump List)
const recentStore = new Store<{ recentDocs: string[] }>({
  name: 'recent-documents',
  defaults: { recentDocs: [] },
})

ipcMain.handle('app:add-recent-document', (_event, docPath: string) => {
  const docs: string[] = (recentStore as any).get('recentDocs') || []
  const updated = [docPath, ...docs.filter((d: string) => d !== docPath)].slice(0, 10)
  ;(recentStore as any).set('recentDocs', updated)
  updateDockMenu()
  updateJumpList()
})

ipcMain.handle('app:clear-recent-documents', () => {
  ;(recentStore as any).set('recentDocs', [])
  updateDockMenu()
  updateJumpList()
})

function updateDockMenu(): void {
  if (process.platform !== 'darwin') return
  const docs: string[] = (recentStore as any).get('recentDocs') || []
  const recentItems = docs.map((doc: string) => ({
    label: path.basename(doc),
    click: () => {
      log.info('[dock] opened recent:', doc)
      if (mainWindow) {
        mainWindow.webContents.send('app:open-recent', doc)
      }
    },
  }))

  app.dock.setMenu(
    Menu.buildFromTemplate([
      { label: 'Последние документы', enabled: false },
      ...(recentItems.length > 0 ? recentItems : [{ label: 'Нет документов', enabled: false }]),
      { type: 'separator' },
      {
        label: 'Очистить',
        click: () => {
          ;(recentStore as any).set('recentDocs', [])
          updateDockMenu()
        },
      },
    ])
  )
}

function updateJumpList(): void {
  if (process.platform !== 'win32') return
  const docs: string[] = (recentStore as any).get('recentDocs') || []
  app.setJumpList([
    {
      type: 'recent',
    },
    {
      type: 'custom',
      name: 'OKAK',
      items: docs.map((doc: string) => ({
        type: 'task' as const,
        title: path.basename(doc),
        description: doc,
        program: process.execPath,
        args: doc,
        iconPath: process.execPath,
        iconIndex: 0,
      })),
    },
  ])
}

// Handle open-file from dock/jumplist
app.on('open-file', (event, docPath) => {
  event.preventDefault()
  log.info('[open-file] from dock/jumplist:', docPath)
  if (mainWindow) {
    mainWindow.webContents.send('app:open-recent', docPath)
    mainWindow.show()
    mainWindow.focus()
  }
})

// Deep link handler
app.on('open-url', (event, url) => {
  event.preventDefault()
  log.info('[deep-link] opened:', url)
  if (mainWindow) {
    const route = url.replace('okak://', '')
    mainWindow.loadURL(isDev ? `http://localhost:3000/${route}` : `http://localhost:${process.env.PORT || '3000'}/${route}`)
    mainWindow.show()
    mainWindow.focus()
  }
})

app.on('ready', () => {
  log.info('App starting... version:', app.getVersion())
  createWindow()
  createTray()
  Menu.setApplicationMenu(buildMenu())
  startConnectivityCheck()

  // Global shortcuts
  globalShortcut.register('CommandOrControl+0', () => {
    if (mainWindow) mainWindow.webContents.setZoomLevel(0)
  })
  globalShortcut.register('F11', () => {
    if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen())
  })

  // Quick note from clipboard
  globalShortcut.register('CommandOrControl+Shift+N', () => {
    const text = clipboard.readText()
    if (text && text.trim().length > 0) {
      log.info('[quick-note] creating from clipboard, length:', text.length)
      if (mainWindow) {
        mainWindow.show()
        mainWindow.focus()
        mainWindow.webContents.send('app:quick-note', {
          title: text.slice(0, 50),
          content: text,
          source: 'clipboard',
        })
      }
    }
  })

  // Toggle AI overlay
  const overlayShortcut = globalShortcut.register('CommandOrControl+Shift+A', () => {
    log.info('[shortcut] Ctrl+Shift+A pressed')
    toggleOverlay()
  })
  log.info('[shortcut] overlay shortcut registered:', overlayShortcut)

  const shortcutRegistered = globalShortcut.register('CommandOrControl+Shift+O', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    } else {
      createWindow()
    }
  })
  log.info('[shortcut] registered:', shortcutRegistered)
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show()
  } else {
    createWindow()
  }
})

app.on('before-quit', () => {
  if (process.platform === 'darwin' && mainWindow) {
    mainWindow.removeAllListeners('close')
  }
})

app.on('quit', () => {
  if (serverProcess) {
    serverProcess.kill()
    serverProcess = null
  }
})

// Security: all external navigation is handled via setWindowOpenHandler in createWindow
