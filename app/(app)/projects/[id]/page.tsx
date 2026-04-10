'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'
import { formatRelativeDate, cn } from '@/lib/utils'
import {
  ArrowLeft,
  MoreHorizontal,
  Trash2,
  Pencil,
  StickyNote,
  CheckSquare,
  Files,
  Plus,
  FolderKanban,
} from 'lucide-react'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const projects = useAppStore((state) => state.projects)
  const notes = useAppStore((state) => state.notes)
  const tasks = useAppStore((state) => state.tasks)
  const files = useAppStore((state) => state.files)
  const deleteProject = useAppStore((state) => state.deleteProject)
  const createNote = useAppStore((state) => state.createNote)
  const updateTask = useAppStore((state) => state.updateTask)

  const project = projects.find((p) => p.id === projectId)
  const projectNotes = notes.filter((n) => n.projectId === projectId)
  const projectTasks = tasks.filter((t) => t.projectId === projectId)
  const projectFiles = files.filter((f) => f.projectId === projectId)

  if (!project) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Проект не найден" />
        <main className="flex flex-1 flex-col items-center justify-center p-6">
          <p className="mb-4 text-muted-foreground">Этот проект не существует или был удален</p>
          <Button onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4" />
            Вернуться к проектам
          </Button>
        </main>
      </div>
    )
  }

  const handleDelete = () => {
    deleteProject(projectId)
    router.push('/projects')
  }

  const handleCreateNote = () => {
    const note = createNote({
      title: 'Новая заметка',
      content: '',
      projectId: projectId,
      tags: [],
      isPinned: false,
    })
    router.push(`/notes/${note.id}`)
  }

  const handleToggleTaskStatus = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done'
    updateTask(taskId, { status: newStatus as 'todo' | 'in-progress' | 'done' })
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={project.name}
        breadcrumbs={[
          { title: 'Проекты', href: '/projects' },
          { title: project.name },
        ]}
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push('/projects')}>
                <Pencil className="h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <main className="flex-1 p-6">
        <div className="mb-6 flex items-start gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${project.color}20` }}
          >
            <FolderKanban
              className="h-7 w-7"
              style={{ color: project.color }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{project.name}</h1>
            <p className="mt-1 text-muted-foreground">
              {project.description || 'Без описания'}
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <StickyNote className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{projectNotes.length}</p>
                <p className="text-sm text-muted-foreground">Заметок</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <CheckSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{projectTasks.length}</p>
                <p className="text-sm text-muted-foreground">Задач</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Files className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{projectFiles.length}</p>
                <p className="text-sm text-muted-foreground">Файлов</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="notes" className="w-full">
          <TabsList>
            <TabsTrigger value="notes">
              <StickyNote className="mr-2 h-4 w-4" />
              Заметки ({projectNotes.length})
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <CheckSquare className="mr-2 h-4 w-4" />
              Задачи ({projectTasks.length})
            </TabsTrigger>
            <TabsTrigger value="files">
              <Files className="mr-2 h-4 w-4" />
              Файлы ({projectFiles.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-4">
            {projectNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <StickyNote className="mb-4 h-10 w-10 text-muted-foreground/50" />
                <p className="mb-4 text-sm text-muted-foreground">Нет заметок в этом проекте</p>
                <Button onClick={handleCreateNote}>
                  <Plus className="h-4 w-4" />
                  Создать заметку
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projectNotes.map((note) => (
                  <Link key={note.id} href={`/notes/${note.id}`}>
                    <Card className="transition-colors hover:bg-accent/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base truncate">{note.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {note.content || 'Пустая заметка'}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {formatRelativeDate(note.updatedAt)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            {projectTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckSquare className="mb-4 h-10 w-10 text-muted-foreground/50" />
                <p className="mb-4 text-sm text-muted-foreground">Нет задач в этом проекте</p>
                <Button onClick={() => router.push('/tasks')}>
                  <Plus className="h-4 w-4" />
                  Создать задачу
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {projectTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border border-border bg-card p-4',
                      task.status === 'done' && 'opacity-60'
                    )}
                  >
                    <button
                      onClick={() => handleToggleTaskStatus(task.id, task.status)}
                      className={cn(
                        'h-5 w-5 rounded-full border-2 transition-colors',
                        task.status === 'done'
                          ? 'border-green-500 bg-green-500'
                          : 'border-muted-foreground'
                      )}
                    >
                      {task.status === 'done' && (
                        <CheckSquare className="h-3 w-3 text-white mx-auto" />
                      )}
                    </button>
                    <div className="flex-1">
                      <span
                        className={cn(
                          'font-medium',
                          task.status === 'done' && 'line-through text-muted-foreground'
                        )}
                      >
                        {task.title}
                      </span>
                      {task.dueDate && (
                        <p className="text-sm text-muted-foreground">
                          Срок: {formatRelativeDate(task.dueDate)}
                        </p>
                      )}
                    </div>
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full',
                        task.priority === 'high' && 'bg-red-500',
                        task.priority === 'medium' && 'bg-yellow-500',
                        task.priority === 'low' && 'bg-green-500'
                      )}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="files" className="mt-4">
            {projectFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Files className="mb-4 h-10 w-10 text-muted-foreground/50" />
                <p className="mb-4 text-sm text-muted-foreground">Нет файлов в этом проекте</p>
                <Button onClick={() => router.push('/files')}>
                  <Plus className="h-4 w-4" />
                  Загрузить файл
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projectFiles.map((file) => (
                  <Card key={file.id} className="transition-colors hover:bg-accent/50">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Files className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatRelativeDate(file.updatedAt)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
