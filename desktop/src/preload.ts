import { contextBridge, ipcRenderer } from 'electron'

const api = {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  getConfig: () => ipcRenderer.invoke('app:get-config'),
}

contextBridge.exposeInMainWorld('electron', api)
