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
  toggleFullscreen(): Promise<void>
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

export async function desktopToggleFullscreen(): Promise<void> {
  if (!isElectron()) return
  return window.electron!.toggleFullscreen()
}
