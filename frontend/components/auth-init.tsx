'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

export function AuthInit() {
  const loadUser = useAppStore((state) => state.loadUser)

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return null
}
