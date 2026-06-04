'use client'

export type ClientMode = 'browser' | 'desktop'

export const CLIENT_MODE_STORAGE_KEY = 'okak_client_mode'

export function getStoredClientMode(): ClientMode | null {
  if (typeof window === 'undefined') {
    return null
  }

  const value = window.localStorage.getItem(CLIENT_MODE_STORAGE_KEY)
  return value === 'browser' || value === 'desktop' ? value : null
}

export function setStoredClientMode(mode: ClientMode): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(CLIENT_MODE_STORAGE_KEY, mode)
}
