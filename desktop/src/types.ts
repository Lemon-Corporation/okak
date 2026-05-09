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
    electron: ElectronAPI
  }
}
