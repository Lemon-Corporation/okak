import log from 'electron-log'

export interface DesktopConfig {
  apiUrl: string
  appUrl: string
  isDev: boolean
}

function getConfig(): DesktopConfig {
  const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development'

  // In dev mode, assume local services. In production, use the hosted web app.
  const defaultApiUrl = isDev ? 'http://localhost:8001' : 'https://okakai.ru'
  const defaultAppUrl = isDev ? 'http://localhost:3000' : 'https://okakai.ru'

  const apiUrl = process.env.API_URL || defaultApiUrl
  const appUrl = process.env.APP_URL || defaultAppUrl

  log.info('[config] mode:', isDev ? 'dev' : 'production')
  log.info('[config] apiUrl:', apiUrl)
  log.info('[config] appUrl:', appUrl)

  return {
    apiUrl,
    appUrl,
    isDev,
  }
}

export const config = getConfig()
