'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Overlay } from '@/components/overlay'
import { ContextCaptureDialog } from '@/components/context-capture-dialog'
import { HighlightOverlay } from '@/components/highlight-overlay'
import { useAppStore } from '@/lib/store'
import { isElectron } from '@/lib/electron'
import { getStoredClientMode } from '@/lib/client-mode'
import { WebModeBanner } from '@/components/web-mode-banner'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const user = useAppStore((state) => state.user)
  const loadProjects = useAppStore((state) => state.loadProjects)
  const loadNotes = useAppStore((state) => state.loadNotes)
  const loadTasks = useAppStore((state) => state.loadTasks)
  const loadFiles = useAppStore((state) => state.loadFiles)
  const openContextCapture = useAppStore((state) => state.openContextCapture)
  const isDesktopApp = isElectron()
  const isGettingStartedRoute = pathname === '/getting-started'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) {
      return
    }

    void (async () => {
      const token = localStorage.getItem('okak_access_token')

      if (!user && !token) {
        router.replace('/login')
        return
      }

      if (!user) {
        await useAppStore.getState().loadUser()
      }

      const clientMode = getStoredClientMode()

      if (!isDesktopApp && !isGettingStartedRoute && !clientMode) {
        router.replace('/getting-started')
        return
      }

      if (isGettingStartedRoute) {
        return
      }

      await loadProjects()
      await Promise.all([loadNotes(), loadTasks(), loadFiles()])
    })()
  }, [mounted, user, router, loadProjects, loadNotes, loadTasks, loadFiles, isDesktopApp, isGettingStartedRoute])

  useEffect(() => {
    if (isGettingStartedRoute) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || !event.shiftKey) return
      if (event.key.toLowerCase() !== 'c') return

      const selection = window.getSelection()?.toString().trim()
      if (!selection) return

      event.preventDefault()
      openContextCapture({ type: 'text', text: selection })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openContextCapture, isGettingStartedRoute])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  if (isGettingStartedRoute) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {!isDesktopApp && <WebModeBanner />}
        {children}
      </SidebarInset>
      <Overlay />
      <ContextCaptureDialog />
      <HighlightOverlay />
    </SidebarProvider>
  )
}
