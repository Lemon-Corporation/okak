'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Overlay } from '@/components/overlay'
import { useAppStore } from '@/lib/store'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [hasHydrated, setHasHydrated] = useState(false)

  const user = useAppStore((state) => state.user)
  const loadProjects = useAppStore((state) => state.loadProjects)
  const loadNotes = useAppStore((state) => state.loadNotes)
  const loadTasks = useAppStore((state) => state.loadTasks)
  const loadFiles = useAppStore((state) => state.loadFiles)

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })

    setHasHydrated(useAppStore.persist.hasHydrated())

    return unsub
  }, [])

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    if (!user) {
      router.replace('/login')
      return
    }

    // Load fresh data from backend on app mount
    // Projects must load first since loadFiles iterates over projects
    void (async () => {
      await loadProjects()
      await Promise.all([loadNotes(), loadTasks(), loadFiles()])
    })()
  }, [hasHydrated, user, router, loadProjects, loadNotes, loadTasks, loadFiles])

  if (!hasHydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
      <Overlay />
    </SidebarProvider>
  )
}