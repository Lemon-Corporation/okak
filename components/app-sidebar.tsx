'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import {
  FileText,
  Home,
  FolderKanban,
  StickyNote,
  CheckSquare,
  Files,
  Settings,
  LogOut,
  Plus,
  Command,
} from 'lucide-react'

const mainNavItems = [
  {
    title: 'Пространство',
    url: '/space',
    icon: Home,
  },
  {
    title: 'Проекты',
    url: '/projects',
    icon: FolderKanban,
  },
  {
    title: 'Заметки',
    url: '/notes',
    icon: StickyNote,
  },
  {
    title: 'Задачи',
    url: '/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Файлы',
    url: '/files',
    icon: Files,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const user = useAppStore((state) => state.user)
  const logout = useAppStore((state) => state.logout)
  const projects = useAppStore((state) => state.projects)
  const setOverlayOpen = useAppStore((state) => state.setOverlayOpen)

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime">
            <FileText className="h-4 w-4 text-black" />
          </div>
          <span className="font-semibold text-sidebar-foreground">ОКАК</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-2">
              <Button
                variant="ghost"
                className="relative overflow-visible h-10 w-full justify-start gap-2 rounded-xl bg-white/10 px-3 text-sm font-medium text-white hover:bg-white/15 hover:text-white"
                onClick={() => setOverlayOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Быстрое создание

                <kbd className="absolute -top-2 -right-2 flex h-6 items-center gap-1 rounded-md border border-white/20 bg-white/15 px-2 text-[10px] font-medium text-white/90 shadow-md backdrop-blur-md">
                  <Command className="h-3 w-3" />
                  Space
                </kbd>
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {projects.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Проекты</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.slice(0, 5).map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/projects/${project.id}`}
                    >
                      <Link href={`/projects/${project.id}`}>
                        <div
                          className="h-3 w-3 rounded"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="truncate">{project.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {projects.length > 5 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/projects" className="text-sidebar-foreground">
                        <span>Показать все ({projects.length})</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/settings'}>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Настройки</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span>Выйти</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
        {user && (
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime">
              <span className="text-xs font-medium text-black">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[140px]">
                {user.name}
              </span>
              <span className="text-xs text-sidebar-foreground truncate max-w-[140px]">
                {user.email}
              </span>
            </div>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
