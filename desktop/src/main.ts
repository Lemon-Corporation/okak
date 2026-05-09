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
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
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
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
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

  // Global shortcuts
  globalShortcut.register('CommandOrControl+0', () => {
    if (mainWindow) mainWindow.webContents.setZoomLevel(0)
  })
  globalShortcut.register('F11', () => {
    if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen())
  })

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
