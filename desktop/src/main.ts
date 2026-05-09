import {
  app,
  BrowserWindow,
  Menu,
  shell,
  ipcMain,
  nativeImage,
  type MenuItemConstructorOptions,
  type HandlerDetails,
} from 'electron'
import path from 'path'
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

function getIcon(): Electron.NativeImage | undefined {
  const iconPath = path.join(__dirname, '..', 'assets', 'icon.svg')
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
    title: 'ОКАК',
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

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler((details: HandlerDetails) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
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

app.on('ready', () => {
  log.info('App starting... version:', app.getVersion())
  createWindow()
  Menu.setApplicationMenu(buildMenu())
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// Security: all external navigation is handled via setWindowOpenHandler in createWindow
