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
    electron: ElectronAPI
  }
}
