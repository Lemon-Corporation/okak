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
  type MenuItemConstructorOptions,
  type HandlerDetails,
} from 'electron'
import path from 'path'
import { spawn, type ChildProcess } from 'child_process'
import log from 'electron-log'
import { config } from './config'

const isDev = !app.isPackaged

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

function getIcon(): Electron.NativeImage | undefined {
  const iconPath = path.join(__dirname, '..', 'assets', 'icon.png')
  try {
    return nativeImage.createFromPath(iconPath)
  } catch {
    return undefined
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
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

  // Hide instead of close (macOS behavior)
  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin') {
      event.preventDefault()
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

app.on('ready', () => {
  log.info('App starting... version:', app.getVersion())
  createWindow()
  createTray()
  Menu.setApplicationMenu(buildMenu())

  // Global shortcut to show/hide window
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
