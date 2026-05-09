export interface DesktopConfig {
  apiUrl: string
  isDev: boolean
}

export interface ElectronAPI {
  platform: string
  versions: {
    node: string
    chrome: string
    electron: string
  }
  getConfig(): Promise<DesktopConfig>
  notify(title: string, body: string): Promise<boolean>
  openFileDialog(): Promise<string[] | null>
  checkOnline(): Promise<boolean>
  setProgressBar(value: number): Promise<void>
  setBadge(count: number): Promise<void>
  setAutoLaunch(enable: boolean): Promise<boolean>
  getAutoLaunch(): Promise<boolean>
  zoomIn(): Promise<void>
  zoomOut(): Promise<void>
  zoomReset(): Promise<void>
  print(): Promise<void>
  minimize(): Promise<void>
  maximize(): Promise<void>
  isMaximized(): Promise<boolean>
  close(): Promise<void>
  onWindowMaximized(callback: (isMaximized: boolean) => void): void
  toggleFullscreen(): Promise<void>
  getDarkMode(): Promise<boolean>
  setDarkMode(enable: boolean): Promise<void>
  onDarkModeChange(callback: (isDark: boolean) => void): void
  addRecentDocument(docPath: string): Promise<void>
  clearRecentDocuments(): Promise<void>
  onOpenRecent(callback: (docPath: string) => void): void
  saveSession(data: { path: string; title: string }[]): Promise<void>
  getSession(): Promise<{ path: string; title: string }[]>
  clearSession(): Promise<void>
  apiRequest(params: { method: string; url: string; body?: unknown; headers?: Record<string, string>; cacheKey?: string; ttl?: number }): Promise<unknown>
  getOfflineStatus(): Promise<boolean>
  getSyncQueue(): Promise<{ id: string; method: string; url: string; body: unknown }[]>
  triggerSync(): Promise<void>
  onOfflineChange(callback: (isOffline: boolean) => void): void
  onSyncComplete(callback: (success: boolean) => void): void
  blockSleep(): Promise<boolean>
  unblockSleep(): Promise<boolean>
  isSleepBlocked(): Promise<boolean>
  getIdleTime(): Promise<number>
  getIdleState(threshold: number): Promise<string>
  findInPage(text: string): Promise<void>
  stopFind(): Promise<void>
  onFoundInPage(callback: (result: { requestId: number; activeMatchOrdinal: number; matches: number }) => void): void
  clipboardRead(): Promise<{ text: string; html: string; rtf: string }>
  clipboardWrite(text: string): Promise<void>
  onQuickNote(callback: (data: { title: string; content: string; source: string }) => void): void
  showOverlay(): Promise<void>
  hideOverlay(): Promise<void>
  toggleOverlay(): Promise<void>
  isOverlayVisible(): Promise<boolean>
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
