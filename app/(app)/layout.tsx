'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Overlay } from '@/components/overlay'
import { useAppStore } from '@/lib/store'
import { seedMockData } from '@/lib/mock-data'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const user = useAppStore((state) => state.user)
  const store = useAppStore()

  // Seed mock data on first load
  useEffect(() => {
    seedMockData(store)
  }, [store])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

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
