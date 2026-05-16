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
  const [mounted, setMounted] = useState(false)

  const user = useAppStore((state) => state.user)
  const loadProjects = useAppStore((state) => state.loadProjects)
  const loadNotes = useAppStore((state) => state.loadNotes)
  const loadTasks = useAppStore((state) => state.loadTasks)
  const loadFiles = useAppStore((state) => state.loadFiles)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) {
      return
    }

    const token = localStorage.getItem('okak_access_token')

    if (!user && !token) {
      router.replace('/login')
      return
    }

    void (async () => {
      if (!user) {
        await useAppStore.getState().loadUser()
      }

      await loadProjects()
      await Promise.all([loadNotes(), loadTasks(), loadFiles()])
    })()
  }, [mounted, user, router, loadProjects, loadNotes, loadTasks, loadFiles])

  if (!mounted) {
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