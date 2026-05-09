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
  minimize: () => ipcRenderer.invoke('app:minimize'),
  maximize: () => ipcRenderer.invoke('app:maximize'),
  isMaximized: () => ipcRenderer.invoke('app:is-maximized'),
  close: () => ipcRenderer.invoke('app:close'),
  onWindowMaximized: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.removeAllListeners('app:window-maximized')
    ipcRenderer.on('app:window-maximized', (_event, isMax) => callback(isMax))
  },
  toggleFullscreen: () => ipcRenderer.invoke('app:toggle-fullscreen'),
  getDarkMode: () => ipcRenderer.invoke('app:get-dark-mode'),
  setDarkMode: (enable: boolean) => ipcRenderer.invoke('app:set-dark-mode', enable),
  onDarkModeChange: (callback: (isDark: boolean) => void) => {
    ipcRenderer.removeAllListeners('app:dark-mode-changed')
    ipcRenderer.on('app:dark-mode-changed', (_event, isDark) => callback(isDark))
  },
  addRecentDocument: (docPath: string) => ipcRenderer.invoke('app:add-recent-document', docPath),
  clearRecentDocuments: () => ipcRenderer.invoke('app:clear-recent-documents'),
  onOpenRecent: (callback: (docPath: string) => void) => {
    ipcRenderer.removeAllListeners('app:open-recent')
    ipcRenderer.on('app:open-recent', (_event, docPath) => callback(docPath))
  },
  saveSession: (data: { path: string; title: string }[]) => ipcRenderer.invoke('app:save-session', data),
  getSession: () => ipcRenderer.invoke('app:get-session'),
  clearSession: () => ipcRenderer.invoke('app:clear-session'),
  apiRequest: (params: { method: string; url: string; body?: unknown; headers?: Record<string, string>; cacheKey?: string; ttl?: number }) =>
    ipcRenderer.invoke('app:api-request', params),
  getOfflineStatus: () => ipcRenderer.invoke('app:get-offline-status'),
  getSyncQueue: () => ipcRenderer.invoke('app:get-sync-queue'),
  triggerSync: () => ipcRenderer.invoke('app:trigger-sync'),
  onOfflineChange: (callback: (isOffline: boolean) => void) => {
    ipcRenderer.removeAllListeners('app:offline-changed')
    ipcRenderer.on('app:offline-changed', (_event, isOffline) => callback(isOffline))
  },
  onSyncComplete: (callback: (success: boolean) => void) => {
    ipcRenderer.removeAllListeners('app:sync-complete')
    ipcRenderer.on('app:sync-complete', (_event, success) => callback(success))
  },
  blockSleep: () => ipcRenderer.invoke('app:block-sleep'),
  unblockSleep: () => ipcRenderer.invoke('app:unblock-sleep'),
  isSleepBlocked: () => ipcRenderer.invoke('app:is-sleep-blocked'),
  getIdleTime: () => ipcRenderer.invoke('app:get-idle-time'),
  getIdleState: (threshold: number) => ipcRenderer.invoke('app:get-idle-state', threshold),
  findInPage: (text: string) => ipcRenderer.invoke('app:find-in-page', text),
  stopFind: () => ipcRenderer.invoke('app:stop-find'),
  onFoundInPage: (callback: (result: { requestId: number; activeMatchOrdinal: number; matches: number }) => void) => {
    ipcRenderer.removeAllListeners('app:found-in-page')
    ipcRenderer.on('app:found-in-page', (_event, result) => callback(result))
  },
  clipboardRead: () => ipcRenderer.invoke('app:clipboard-read'),
  clipboardWrite: (text: string) => ipcRenderer.invoke('app:clipboard-write', text),
  onQuickNote: (callback: (data: { title: string; content: string; source: string }) => void) => {
    ipcRenderer.removeAllListeners('app:quick-note')
    ipcRenderer.on('app:quick-note', (_event, data) => callback(data))
  },
  showOverlay: () => ipcRenderer.invoke('app:show-overlay'),
  hideOverlay: () => ipcRenderer.invoke('app:hide-overlay'),
  toggleOverlay: () => ipcRenderer.invoke('app:toggle-overlay'),
  isOverlayVisible: () => ipcRenderer.invoke('app:is-overlay-visible'),
}

contextBridge.exposeInMainWorld('electron', api)
