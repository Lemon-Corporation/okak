import log from 'electron-log'

export interface DesktopConfig {
  apiUrl: string
  isDev: boolean
}

function getConfig(): DesktopConfig {
  const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development'

  // In dev mode, assume backend runs locally
  const defaultApiUrl = isDev ? 'http://localhost:8000' : 'https://api.okak.app'

  const apiUrl = process.env.API_URL || defaultApiUrl

  log.info('[config] mode:', isDev ? 'dev' : 'production')
  log.info('[config] apiUrl:', apiUrl)

  return {
    apiUrl,
    isDev,
  }
}

export const config = getConfig()
