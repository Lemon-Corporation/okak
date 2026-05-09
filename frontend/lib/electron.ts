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
    electron?: ElectronAPI
  }
}

export function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electron
}

export function getElectronPlatform(): string | undefined {
  return window.electron?.platform
}

export async function getElectronConfig(): Promise<DesktopConfig | undefined> {
  if (!isElectron()) return undefined
  return window.electron!.getConfig()
}

export async function sendElectronNotification(title: string, body: string): Promise<boolean> {
  if (!isElectron()) return false
  return window.electron!.notify(title, body)
}

export async function openElectronFileDialog(): Promise<string[] | null> {
  if (!isElectron()) return null
  return window.electron!.openFileDialog()
}

export async function isElectronOnline(): Promise<boolean> {
  if (!isElectron()) return true
  return window.electron!.checkOnline()
}

export async function setDesktopProgressBar(value: number): Promise<void> {
  if (!isElectron()) return
  return window.electron!.setProgressBar(value)
}

export async function setDesktopBadge(count: number): Promise<void> {
  if (!isElectron()) return
  return window.electron!.setBadge(count)
}

export async function setDesktopAutoLaunch(enable: boolean): Promise<boolean> {
  if (!isElectron()) return false
  return window.electron!.setAutoLaunch(enable)
}

export async function getDesktopAutoLaunch(): Promise<boolean> {
  if (!isElectron()) return false
  return window.electron!.getAutoLaunch()
}

export async function desktopZoomIn(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.zoomIn()
}

export async function desktopZoomOut(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.zoomOut()
}

export async function desktopZoomReset(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.zoomReset()
}

export async function desktopPrint(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.print()
}

export async function desktopMinimize(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.minimize()
}

export async function desktopMaximize(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.maximize()
}

export async function desktopIsMaximized(): Promise<boolean> {
  if (!isElectron()) return false
  return window.electron!.isMaximized()
}

export async function desktopClose(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.close()
}

export function onDesktopWindowMaximized(callback: (isMaximized: boolean) => void): void {
  if (!isElectron()) return
  window.electron!.onWindowMaximized(callback)
}

export async function desktopToggleFullscreen(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.toggleFullscreen()
}

export async function desktopGetDarkMode(): Promise<boolean> {
  if (!isElectron()) return window.matchMedia('(prefers-color-scheme: dark)').matches
  return window.electron!.getDarkMode()
}

export async function desktopSetDarkMode(enable: boolean): Promise<void> {
  if (!isElectron()) return
  return window.electron!.setDarkMode(enable)
}

export function onDesktopDarkModeChange(callback: (isDark: boolean) => void): void {
  if (!isElectron()) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', (e) => callback(e.matches))
    return
  }
  window.electron!.onDarkModeChange(callback)
}

export async function addDesktopRecentDocument(docPath: string): Promise<void> {
  if (!isElectron()) return
  return window.electron!.addRecentDocument(docPath)
}

export async function clearDesktopRecentDocuments(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.clearRecentDocuments()
}

export function onDesktopOpenRecent(callback: (docPath: string) => void): void {
  if (!isElectron()) return
  window.electron!.onOpenRecent(callback)
}

export async function saveDesktopSession(data: { path: string; title: string }[]): Promise<void> {
  if (!isElectron()) return
  return window.electron!.saveSession(data)
}

export async function getDesktopSession(): Promise<{ path: string; title: string }[]> {
  if (!isElectron()) return []
  return window.electron!.getSession()
}

export async function clearDesktopSession(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.clearSession()
}

export async function desktopApiRequest(params: { method: string; url: string; body?: unknown; headers?: Record<string, string>; cacheKey?: string; ttl?: number }): Promise<unknown> {
  if (!isElectron()) {
    // Fallback to regular fetch for web
    const response = await fetch(params.url, {
      method: params.method,
      headers: { 'Content-Type': 'application/json', ...(params.headers || {}) },
      body: params.body ? JSON.stringify(params.body) : undefined,
    })
    return { success: response.ok, data: await response.json(), status: response.status }
  }
  return window.electron!.apiRequest(params)
}

export async function getDesktopOfflineStatus(): Promise<boolean> {
  if (!isElectron()) return false
  return window.electron!.getOfflineStatus()
}

export async function getDesktopSyncQueue(): Promise<{ id: string; method: string; url: string; body: unknown }[]> {
  if (!isElectron()) return []
  return window.electron!.getSyncQueue()
}

export async function triggerDesktopSync(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.triggerSync()
}

export function onDesktopOfflineChange(callback: (isOffline: boolean) => void): void {
  if (!isElectron()) {
    window.addEventListener('online', () => callback(false))
    window.addEventListener('offline', () => callback(true))
    return
  }
  window.electron!.onOfflineChange(callback)
}

export function onDesktopSyncComplete(callback: (success: boolean) => void): void {
  if (!isElectron()) return
  window.electron!.onSyncComplete(callback)
}

export async function desktopBlockSleep(): Promise<boolean> {
  if (!isElectron()) return false
  return window.electron!.blockSleep()
}

export async function desktopUnblockSleep(): Promise<boolean> {
  if (!isElectron()) return false
  return window.electron!.unblockSleep()
}

export async function desktopIsSleepBlocked(): Promise<boolean> {
  if (!isElectron()) return false
  return window.electron!.isSleepBlocked()
}

export async function desktopGetIdleTime(): Promise<number> {
  if (!isElectron()) return 0
  return window.electron!.getIdleTime()
}

export async function desktopGetIdleState(threshold: number): Promise<string> {
  if (!isElectron()) return 'unknown'
  return window.electron!.getIdleState(threshold)
}

export async function desktopFindInPage(text: string): Promise<void> {
  if (!isElectron()) return
  return window.electron!.findInPage(text)
}

export async function desktopStopFind(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.stopFind()
}

export function onDesktopFoundInPage(callback: (result: { requestId: number; activeMatchOrdinal: number; matches: number }) => void): void {
  if (!isElectron()) return
  window.electron!.onFoundInPage(callback)
}

export async function desktopClipboardRead(): Promise<{ text: string; html: string; rtf: string }> {
  if (!isElectron()) {
    return { text: '', html: '', rtf: '' }
  }
  return window.electron!.clipboardRead()
}

export async function desktopClipboardWrite(text: string): Promise<void> {
  if (!isElectron()) return
  return window.electron!.clipboardWrite(text)
}

export function onDesktopQuickNote(callback: (data: { title: string; content: string; source: string }) => void): void {
  if (!isElectron()) return
  window.electron!.onQuickNote(callback)
}

export async function desktopShowOverlay(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.showOverlay()
}

export async function desktopHideOverlay(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.hideOverlay()
}

export async function desktopToggleOverlay(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.toggleOverlay()
}

export async function desktopIsOverlayVisible(): Promise<boolean> {
  if (!isElectron()) return false
  return window.electron!.isOverlayVisible()
}
