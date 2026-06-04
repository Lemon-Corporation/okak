'use client'

export type DesktopPlatform = 'macos' | 'windows' | 'linux' | 'other'

export interface DesktopReleaseInfo {
  downloadUrl: string | null
  platform: DesktopPlatform
  releasePageUrl: string
  version: string
}

const RELEASES_API_URL = 'https://api.github.com/repos/Lemon-Corporation/okak-release/releases/latest'
const RELEASES_PAGE_URL = 'https://github.com/Lemon-Corporation/okak-release/releases/latest'

export function detectDesktopPlatform(platform = typeof window !== 'undefined' ? window.navigator.platform : ''): DesktopPlatform {
  const normalized = platform.toLowerCase()

  if (normalized.includes('mac')) {
    return 'macos'
  }

  if (normalized.includes('win')) {
    return 'windows'
  }

  if (normalized.includes('linux')) {
    return 'linux'
  }

  return 'other'
}

export async function fetchLatestDesktopRelease(platform: DesktopPlatform): Promise<DesktopReleaseInfo> {
  try {
    const response = await fetch(RELEASES_API_URL)
    const data = await response.json()
    const assets = Array.isArray(data.assets) ? data.assets : []

    const matcher =
      platform === 'macos'
        ? '.dmg'
        : platform === 'windows'
          ? '.exe'
          : platform === 'linux'
            ? '.AppImage'
            : null

    const asset =
      matcher === null
        ? null
        : assets.find(
            (entry: { browser_download_url?: string; name?: string }) =>
              typeof entry.name === 'string' && entry.name.endsWith(matcher)
          )

    return {
      downloadUrl:
        asset && typeof asset.browser_download_url === 'string'
          ? asset.browser_download_url
          : null,
      platform,
      releasePageUrl: RELEASES_PAGE_URL,
      version: typeof data.tag_name === 'string' ? data.tag_name : '',
    }
  } catch {
    return {
      downloadUrl: null,
      platform,
      releasePageUrl: RELEASES_PAGE_URL,
      version: '',
    }
  }
}
