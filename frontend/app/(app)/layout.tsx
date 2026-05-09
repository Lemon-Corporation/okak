'use client'

import { useEffect } from 'react'
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
  const user = useAppStore((state) => state.user)
  const loadProjects = useAppStore((state) => state.loadProjects)
  const loadNotes = useAppStore((state) => state.loadNotes)
  const loadTasks = useAppStore((state) => state.loadTasks)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    // Load fresh data from backend on app mount
    loadProjects()
    loadNotes()
    loadTasks()
  }, [user, router, loadProjects, loadNotes, loadTasks])

  if (!user) {
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
