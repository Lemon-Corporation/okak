'use client'

import { useEffect, useState } from 'react'
import {
  isElectron,
  getElectronPlatform,
  getElectronConfig,
  sendElectronNotification,
  type DesktopConfig,
} from '@/lib/electron'

export function useElectron() {
  const [config, setConfig] = useState<DesktopConfig | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isElectron()) return
    getElectronConfig().then((cfg) => {
      if (cfg) {
        setConfig(cfg)
      }
      setReady(true)
    })
  }, [])

  return {
    isElectron: isElectron(),
    platform: getElectronPlatform(),
    config,
    ready,
    notify: sendElectronNotification,
  }
}
