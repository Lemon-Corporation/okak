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
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
