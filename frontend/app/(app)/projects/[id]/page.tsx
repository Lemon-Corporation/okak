'use client'

import { useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'
import { formatRelativeDate, cn } from '@/lib/utils'
import type { Task } from '@/lib/types'
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
  Calendar,
  Upload,
  Loader2,
} from 'lucide-react'

type TaskStatus = Task['status']
type TaskPriority = Task['priority']

const statusLabels: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  'in-progress': 'В работе',
  done: 'Выполнено',
}

const statusColors: Record<TaskStatus, string> = {
  todo: 'bg-slate-400',
  'in-progress': 'bg-blue-500',
  done: 'bg-green-500',
}

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const projects = useAppStore((state) => state.projects)
  const notes = useAppStore((state) => state.notes)
  const tasks = useAppStore((state) => state.tasks)
  const files = useAppStore((state) => state.files)
  const deleteProject = useAppStore((state) => state.deleteProject)
  const createNote = useAppStore((state) => state.createNote)
  const updateTask = useAppStore((state) => state.updateTask)
  const createFile = useAppStore((state) => state.createFile)
  const deleteFile = useAppStore((state) => state.deleteFile)

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isUploadingFile, setIsUploadingFile] = useState(false)

  const project = projects.find((p) => p.id === projectId)
  const projectNotes = notes.filter((n) => n.projectId === projectId)
  const projectTasks = tasks.filter((t) => t.projectId === projectId)
  const projectFiles = files.filter((f) => f.projectId === projectId)

  const groupedTasks = {
    todo: projectTasks.filter((task) => task.status === 'todo'),
    'in-progress': projectTasks.filter((task) => task.status === 'in-progress'),
    done: projectTasks.filter((task) => task.status === 'done'),
  }

  if (!project) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Проект не найден" />
        <main className="flex flex-1 flex-col items-center justify-center p-6">
          <p className="mb-4 text-muted-foreground">
            Этот проект не существует или был удален
          </p>
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

  const handleCreateNote = async () => {
    const note = await createNote({
      title: 'Новая заметка',
      content: '',
      projectId: projectId,
      tags: [],
      isPinned: false,
    })

    router.push(`/notes/${note.id}`)
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTask(taskId, { status })
  }

  const handleDropTask = async (status: TaskStatus) => {
    if (!draggedTaskId) {
      return
    }

    const task = projectTasks.find((item) => item.id === draggedTaskId)

    if (!task || task.status === status) {
      setDraggedTaskId(null)
      return
    }

    await handleStatusChange(draggedTaskId, status)
    setDraggedTaskId(null)
  }

  const handleSelectFiles = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])

    if (selectedFiles.length === 0) {
      return
    }

    setIsUploadingFile(true)

    try {
      for (const file of selectedFiles) {
        await createFile(file, projectId)
      }
    } finally {
      setIsUploadingFile(false)
      event.target.value = ''
    }
  }

  const handleDeleteFile = async () => {
    if (!fileToDelete) {
      return
    }

    await deleteFile(fileToDelete.id)
    setFileToDelete(null)
  }

  const renderTaskItem = (task: Task) => (
    <div
      key={task.id}
      draggable
      onDragStart={() => setDraggedTaskId(task.id)}
      onDragEnd={() => setDraggedTaskId(null)}
      className={cn(
        'group flex cursor-grab items-start rounded-lg border border-border bg-card p-4 transition-colors hover:border-blue-400 hover:bg-blue/5 active:cursor-grabbing',
        draggedTaskId === task.id && 'opacity-50',
        task.status === 'done' && 'opacity-60'
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'h-2.5 w-2.5 shrink-0 rounded-full',
              statusColors[task.status]
            )}
            title={statusLabels[task.status]}
          />

          <span
            className={cn(
              'font-medium text-foreground',
              task.status === 'done' && 'text-muted-foreground line-through'
            )}
          >
            {task.title}
          </span>
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {task.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
            style={{
              backgroundColor: `${project.color}20`,
              color: project.color || undefined,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: project.color || undefined }}
            />
            {project.name}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
            <span className={cn('h-1.5 w-1.5 rounded-full', priorityColors[task.priority])} />
            Приоритет: {priorityLabels[task.priority]}
          </span>

          {task.dueDate && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatRelativeDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'todo')}>
            К выполнению
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'in-progress')}>
            В работе
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'done')}>
            Выполнено
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

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
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />

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
                <p className="mb-4 text-sm text-muted-foreground">
                  Нет заметок в этом проекте
                </p>
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
                        <CardTitle className="truncate text-base">{note.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
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
                <p className="mb-4 text-sm text-muted-foreground">
                  Нет задач в этом проекте
                </p>
                <Button onClick={() => router.push('/tasks')}>
                  <Plus className="h-4 w-4" />
                  Создать задачу
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                {(['todo', 'in-progress', 'done'] as const).map((status) => (
                  <Card
                    key={status}
                    onDragOver={(event) => {
                      event.preventDefault()
                    }}
                    onDrop={() => {
                      void handleDropTask(status)
                    }}
                    className={cn(
                      'flex flex-col transition-colors',
                      draggedTaskId && 'border-blue-400/60 bg-blue/5'
                    )}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-base">
                        <span>{statusLabels[status]}</span>
                        <span className="text-sm font-normal text-muted-foreground">
                          {groupedTasks[status].length}
                        </span>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex min-h-[160px] flex-1 flex-col gap-3">
                      {groupedTasks[status].length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          Перетащите задачу сюда
                        </p>
                      ) : (
                        groupedTasks[status].map(renderTaskItem)
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="files" className="mt-4">
            <div className="mb-4 flex justify-end">
              <Button
                variant="outline"
                onClick={handleSelectFiles}
                disabled={isUploadingFile}
              >
                {isUploadingFile ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isUploadingFile ? 'Загрузка...' : 'Добавить файл'}
              </Button>
            </div>

            {projectFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Files className="mb-4 h-10 w-10 text-muted-foreground/50" />
                <p className="mb-4 text-sm text-muted-foreground">
                  Нет файлов в этом проекте
                </p>
                <Button onClick={handleSelectFiles} disabled={isUploadingFile}>
                  {isUploadingFile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {isUploadingFile ? 'Загрузка...' : 'Загрузить файл'}
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projectFiles.map((file) => (
                  <Card key={file.id} className="transition-colors hover:bg-accent/50">
                    <CardContent className="flex flex-col gap-4 p-4">
                      <div className="flex items-center gap-3">
                        <Files className="h-8 w-8 shrink-0 text-muted-foreground" />

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatRelativeDate(file.updatedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline" className="flex-1">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                          >
                            Скачать
                          </a>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            setFileToDelete({ id: file.id, name: file.name })
                          }}
                        >
                          Удалить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog
        open={Boolean(fileToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setFileToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить файл?</DialogTitle>
            <DialogDescription>
              Файл «{fileToDelete?.name}» будет удалён из проекта. Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFileToDelete(null)}
            >
              Отмена
            </Button>
            <Button
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                void handleDeleteFile()
              }}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}