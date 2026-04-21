'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import {
  Search,
  StickyNote,
  CheckSquare,
  FolderKanban,
  Files,
  X,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type QuickAction = {
  id: string
  title: string
  icon: React.ElementType
  action: () => void
  shortcut?: string
}

export function Overlay() {
  const router = useRouter()
  const isOverlayOpen = useAppStore((state) => state.isOverlayOpen)
  const setOverlayOpen = useAppStore((state) => state.setOverlayOpen)
  const search = useAppStore((state) => state.search)
  const createNote = useAppStore((state) => state.createNote)
  const createTask = useAppStore((state) => state.createTask)

  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'search' | 'create-note' | 'create-task'>('search')
  const [newTitle, setNewTitle] = useState('')

  const searchResults = query.length >= 2 ? search(query) : null
  const hasResults = searchResults && (
    searchResults.notes.length > 0 ||
    searchResults.tasks.length > 0 ||
    searchResults.projects.length > 0 ||
    searchResults.files.length > 0
  )

  const handleClose = useCallback(() => {
    setOverlayOpen(false)
    setQuery('')
    setMode('search')
    setNewTitle('')
  }, [setOverlayOpen])

  const quickActions: QuickAction[] = [
    {
      id: 'new-note',
      title: 'Новая заметка',
      icon: StickyNote,
      shortcut: 'N',
      action: () => setMode('create-note'),
    },
    {
      id: 'new-task',
      title: 'Новая задача',
      icon: CheckSquare,
      shortcut: 'T',
      action: () => setMode('create-task'),
    },
    {
      id: 'go-projects',
      title: 'Перейти к проектам',
      icon: FolderKanban,
      shortcut: 'P',
      action: () => {
        router.push('/projects')
        handleClose()
      },
    },
    {
      id: 'go-files',
      title: 'Перейти к файлам',
      icon: Files,
      shortcut: 'F',
      action: () => {
        router.push('/files')
        handleClose()
      },
    },
  ]

  const handleCreateNote = () => {
    if (newTitle.trim()) {
      const note = createNote({
        title: newTitle.trim(),
        content: '',
        projectId: null,
        tags: [],
        isPinned: false,
      })
      router.push(`/notes/${note.id}`)
      handleClose()
    }
  }

  const handleCreateTask = () => {
    if (newTitle.trim()) {
      createTask({
        title: newTitle.trim(),
        description: '',
        projectId: null,
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        tags: [],
      })
      router.push('/tasks')
      handleClose()
    }
  }

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault()
        setOverlayOpen(!isOverlayOpen)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOverlayOpen, setOverlayOpen])

  // Quick action shortcuts when overlay is open
  useEffect(() => {
    if (!isOverlayOpen || mode !== 'search') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
        return
      }

      const action = quickActions.find(
        (a) => a.shortcut?.toLowerCase() === e.key.toLowerCase() && !e.ctrlKey && !e.metaKey
      )
      if (action && query === '') {
        e.preventDefault()
        action.action()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOverlayOpen, mode, query, quickActions, handleClose])

  return (
    <Dialog open={isOverlayOpen} onOpenChange={setOverlayOpen}>
      <DialogContent showCloseButton = {false} className="max-w-2xl gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogTitle className="sr-only">Быстрые действия и поиск</DialogTitle>
        
        {mode === 'search' && (
          <>
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск заметок, задач, проектов..."
                className="h-14 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {!query && (
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    Быстрые действия
                  </p>
                  <div className="mt-1 flex flex-col gap-1">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={action.action}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        <action.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{action.title}</span>
                        {action.shortcut && (
                          <kbd className="ml-auto flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                            {action.shortcut}
                          </kbd>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query && !hasResults && (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Ничего не найдено по запросу &quot;{query}&quot;
                  </p>
                </div>
              )}

              {searchResults && hasResults && (
                <div className="p-2">
                  {searchResults.notes.length > 0 && (
                    <div className="mb-2">
                      <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        Заметки
                      </p>
                      {searchResults.notes.slice(0, 3).map((note) => (
                        <button
                          key={note.id}
                          onClick={() => {
                            router.push(`/notes/${note.id}`)
                            handleClose()
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent transition-colors"
                        >
                          <StickyNote className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate text-sm text-foreground">{note.title}</span>
                          <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.tasks.length > 0 && (
                    <div className="mb-2">
                      <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        Задачи
                      </p>
                      {searchResults.tasks.slice(0, 3).map((task) => (
                        <button
                          key={task.id}
                          onClick={() => {
                            router.push('/tasks')
                            handleClose()
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent transition-colors"
                        >
                          <CheckSquare className={cn(
                            'h-4 w-4',
                            task.status === 'done' ? 'text-green-500' : 'text-muted-foreground'
                          )} />
                          <span className={cn(
                            'truncate text-sm',
                            task.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'
                          )}>
                            {task.title}
                          </span>
                          <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.projects.length > 0 && (
                    <div className="mb-2">
                      <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        Проекты
                      </p>
                      {searchResults.projects.slice(0, 3).map((project) => (
                        <button
                          key={project.id}
                          onClick={() => {
                            router.push(`/projects/${project.id}`)
                            handleClose()
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent transition-colors"
                        >
                          <div
                            className="h-3 w-3 rounded"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="truncate text-sm text-foreground">{project.name}</span>
                          <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.files.length > 0 && (
                    <div>
                      <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        Файлы
                      </p>
                      {searchResults.files.slice(0, 3).map((file) => (
                        <button
                          key={file.id}
                          onClick={() => {
                            router.push('/files')
                            handleClose()
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent transition-colors"
                        >
                          <Files className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate text-sm text-foreground">{file.name}</span>
                          <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {mode === 'create-note' && (
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Новая заметка</span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMode('search')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Название заметки"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateNote()
                }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMode('search')}>
                  Отмена
                </Button>
                <Button onClick={handleCreateNote} disabled={!newTitle.trim()}>
                  <Plus className="h-4 w-4" />
                  Создать
                </Button>
              </div>
            </div>
          </div>
        )}

        {mode === 'create-task' && (
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Новая задача</span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMode('search')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Название задачи"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateTask()
                }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMode('search')}>
                  Отмена
                </Button>
                <Button onClick={handleCreateTask} disabled={!newTitle.trim()}>
                  <Plus className="h-4 w-4" />
                  Создать
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
