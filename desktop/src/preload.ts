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
}

contextBridge.exposeInMainWorld('electron', api)
