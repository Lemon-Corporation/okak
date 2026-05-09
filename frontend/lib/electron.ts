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
