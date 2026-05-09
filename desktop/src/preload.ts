import { contextBridge, ipcRenderer } from 'electron'

const api = {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  getConfig: () => ipcRenderer.invoke('app:get-config'),
  notify: (title: string, body: string) => ipcRenderer.invoke('app:notify', { title, body }),
  onFileDrop: (callback: (files: Array<{ name: string; path: string; size: number; type: string }>) => void) => {
    ipcRenderer.removeAllListeners('app:file-drop')
    ipcRenderer.on('app:file-drop', (_event, files) => callback(files))
  },
  openFileDialog: () => ipcRenderer.invoke('app:open-file'),
  checkOnline: () => ipcRenderer.invoke('app:check-online'),
  setProgressBar: (value: number) => ipcRenderer.invoke('app:set-progress-bar', value),
  setBadge: (count: number) => ipcRenderer.invoke('app:set-badge', count),
  setAutoLaunch: (enable: boolean) => ipcRenderer.invoke('app:set-auto-launch', enable),
  getAutoLaunch: () => ipcRenderer.invoke('app:get-auto-launch'),
  zoomIn: () => ipcRenderer.invoke('app:zoom-in'),
  zoomOut: () => ipcRenderer.invoke('app:zoom-out'),
  zoomReset: () => ipcRenderer.invoke('app:zoom-reset'),
  print: () => ipcRenderer.invoke('app:print'),
  toggleFullscreen: () => ipcRenderer.invoke('app:toggle-fullscreen'),
}

contextBridge.exposeInMainWorld('electron', api)
