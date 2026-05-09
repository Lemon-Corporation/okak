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
