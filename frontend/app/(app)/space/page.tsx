'use client'

import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { formatRelativeDate } from '@/lib/utils'
import Link from 'next/link'
import {
  StickyNote,
  CheckSquare,
  FolderKanban,
  Files,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-react'

export default function SpacePage() {
  const user = useAppStore((state) => state.user)
  const notes = useAppStore((state) => state.notes)
  const tasks = useAppStore((state) => state.tasks)
  const projects = useAppStore((state) => state.projects)
  const files = useAppStore((state) => state.files)
  const setOverlayOpen = useAppStore((state) => state.setOverlayOpen)

  const recentNotes = [...notes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 3)

  const activeTasks = tasks.filter((t) => t.status !== 'done').slice(0, 5)
  const completedTasksCount = tasks.filter((t) => t.status === 'done').length

  const stats = [
    { label: 'Заметки', value: notes.length, icon: StickyNote, href: '/notes', color: 'bg-blue-500/10 text-blue-600' },
    { label: 'Задачи', value: tasks.length, icon: CheckSquare, href: '/tasks', color: 'bg-green-500/10 text-green-600' },
    { label: 'Проекты', value: projects.length, icon: FolderKanban, href: '/projects', color: 'bg-orange-500/10 text-orange-600' },
    { label: 'Файлы', value: files.length, icon: Files, href: '/files', color: 'bg-purple-500/10 text-purple-600' },
  ]

  return (
    <div className="flex flex-col">
      <PageHeader 
        title="Пространство"
        actions={
          <Button onClick={() => setOverlayOpen(true)}>
            <Plus className="h-4 w-4" />
            Создать
          </Button>
        }
      />

      <main className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Привет, {user?.name || 'Пользователь'}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Вот обзор вашего рабочего пространства
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Notes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Последние заметки</CardTitle>
                  <CardDescription>Недавно обновленные заметки</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/notes">
                    Все заметки
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <StickyNote className="mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Нет заметок</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setOverlayOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Создать заметку
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentNotes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/notes/${note.id}`}
                      className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                    >
                      <StickyNote className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{note.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {note.content || 'Пустая заметка'}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {formatRelativeDate(note.updatedAt)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Активные задачи</CardTitle>
                  <CardDescription>
                    Выполнено {completedTasksCount} из {tasks.length} задач
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/tasks">
                    Все задачи
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckSquare className="mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Нет активных задач</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setOverlayOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Создать задачу
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {activeTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                    >
                      <div className={`h-2 w-2 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.status === 'in-progress' ? 'В работе' : 'К выполнению'}
                        </p>
                      </div>
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
