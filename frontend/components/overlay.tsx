'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { searchApi } from '@/lib/api'
import type { SearchResponse } from '@/lib/api/dto'
import {
  Search,
  StickyNote,
  CheckSquare,
  FolderKanban,
  Files,
  X,
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle,
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
  const projects = useAppStore((state) => state.projects)
  const createNote = useAppStore((state) => state.createNote)
  const createTask = useAppStore((state) => state.createTask)

  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'search' | 'create-note' | 'create-task'>('search')
  const [newTitle, setNewTitle] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [apiResults, setApiResults] = useState<SearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchResults = apiResults
    ? {
        notes: apiResults.notes.map((n) => ({
          id: n.id,
          title: n.title,
          content: '',
          projectId: n.project_id,
          tags: [] as string[],
          isPinned: n.is_pinned,
          createdAt: n.updated_at,
          updatedAt: n.updated_at,
        })),
        tasks: apiResults.tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: '',
          projectId: t.project_id,
          status:
            t.status === 'in_progress'
              ? ('in-progress' as const)
              : t.status === 'done'
                ? ('done' as const)
                : ('todo' as const),
          priority: (
            t.priority === 'high' || t.priority === 'urgent'
              ? 'high'
              : t.priority === 'low' || t.priority === 'none'
                ? 'low'
                : 'medium'
          ) as 'low' | 'medium' | 'high',
          dueDate: null,
          tags: [] as string[],
          createdAt: t.updated_at,
          updatedAt: t.updated_at,
        })),
        projects: apiResults.projects.map((p) => ({
          id: p.id,
          name: p.title,
          description: '',
          color: p.color,
          icon: 'folder',
          createdAt: p.updated_at,
          updatedAt: p.updated_at,
        })),
        files: [] as { id: string; name: string; projectId: string | null }[],
      }
    : null

  const hasResults =
    searchResults &&
    (searchResults.notes.length > 0 ||
      searchResults.tasks.length > 0 ||
      searchResults.projects.length > 0 ||
      (searchResults.files && searchResults.files.length > 0))

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])

  // Debounced backend search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.length < 2) {
      setApiResults(null)
      setSearchError('')
      setIsSearching(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      setSearchError('')

      try {
        const res = await searchApi.search(query)
        setApiResults(res)
      } catch (err) {
        setApiResults(null)
        setSearchError(err instanceof Error ? err.message : 'Не удалось выполнить поиск')
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const handleClose = useCallback(() => {
    setOverlayOpen(false)
    setQuery('')
    setMode('search')
    setNewTitle('')
    setSelectedProjectId(projects[0]?.id ?? '')
    setApiResults(null)
    setSearchError('')
    setIsSearching(false)
  }, [setOverlayOpen, projects])

  const quickActions: QuickAction[] = [
    {
      id: 'new-note',
      title: 'Новая заметка',
      icon: StickyNote,
      shortcut: 'N',
      action: () => {
        setSearchError('')
        setSelectedProjectId(projects[0]?.id ?? '')
        setMode('create-note')
      },
    },
    {
      id: 'new-task',
      title: 'Новая задача',
      icon: CheckSquare,
      shortcut: 'T',
      action: () => {
        setSearchError('')
        setSelectedProjectId(projects[0]?.id ?? '')
        setMode('create-task')
      },
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

  const handleCreateNote = async () => {
    if (!newTitle.trim()) return

    if (!selectedProjectId) {
      setSearchError('Выберите проект')
      return
    }

    const note = await createNote({
      title: newTitle.trim(),
      content: '',
      projectId: selectedProjectId,
      tags: [],
      isPinned: false,
    })

    router.push(`/notes/${note.id}`)
    handleClose()
  }

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return

    if (!selectedProjectId) {
      setSearchError('Выберите проект')
      return
    }

    await createTask({
      title: newTitle.trim(),
      description: '',
      projectId: selectedProjectId,
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      tags: [],
    })

    router.push('/tasks')
    handleClose()
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

  const projectSelect = (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">Проект</label>
      <Select
        value={selectedProjectId}
        onValueChange={(value) => {
          setSelectedProjectId(value)
          setSearchError('')
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Выберите проект" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <Dialog open={isOverlayOpen} onOpenChange={setOverlayOpen}>
      <DialogContent showCloseButton={false} className="max-w-2xl gap-0 overflow-hidden p-0 sm:rounded-xl">
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
              <Button variant="ghost" size="icon-sm" onClick={handleClose}>
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
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
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

              {isSearching && (
                <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Ищем...
                </div>
              )}

              {!isSearching && searchError && (
                <div role="alert" className="flex items-center gap-2 p-4 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {searchError}
                </div>
              )}

              {query && !isSearching && !hasResults && (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Ничего не найдено по запросу &quot;{query}&quot;
                  </p>
                </div>
              )}

              {searchResults && hasResults && !isSearching && (
                <div className="p-2">
                  {searchResults.notes.length > 0 && (
                    <div className="mb-2">
                      <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Заметки</p>
                      {searchResults.notes.slice(0, 3).map((note) => (
                        <button
                          key={note.id}
                          onClick={() => {
                            router.push(`/notes/${note.id}`)
                            handleClose()
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
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
                      <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Задачи</p>
                      {searchResults.tasks.slice(0, 3).map((task) => (
                        <button
                          key={task.id}
                          onClick={() => {
                            router.push('/tasks')
                            handleClose()
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
                        >
                          <CheckSquare
                            className={cn(
                              'h-4 w-4',
                              task.status === 'done' ? 'text-green-500' : 'text-muted-foreground'
                            )}
                          />
                          <span
                            className={cn(
                              'truncate text-sm',
                              task.status === 'done'
                                ? 'text-muted-foreground line-through'
                                : 'text-foreground'
                            )}
                          >
                            {task.title}
                          </span>
                          <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.projects.length > 0 && (
                    <div className="mb-2">
                      <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Проекты</p>
                      {searchResults.projects.slice(0, 3).map((project) => (
                        <button
                          key={project.id}
                          onClick={() => {
                            router.push(`/projects/${project.id}`)
                            handleClose()
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
                        >
                          <div className="h-3 w-3 rounded" style={{ backgroundColor: project.color }} />
                          <span className="truncate text-sm text-foreground">{project.name}</span>
                          <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Files search not supported by backend search API yet */}
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
              <Button variant="ghost" size="icon-sm" onClick={() => setMode('search')}>
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
                  if (e.key === 'Enter') {
                    void handleCreateNote()
                  }
                }}
              />

              {projectSelect}

              {searchError && (
                <div role="alert" className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {searchError}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMode('search')}>
                  Отмена
                </Button>
                <Button onClick={handleCreateNote} disabled={!newTitle.trim() || !selectedProjectId}>
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
              <Button variant="ghost" size="icon-sm" onClick={() => setMode('search')}>
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
                  if (e.key === 'Enter') {
                    void handleCreateTask()
                  }
                }}
              />

              {projectSelect}

              {searchError && (
                <div role="alert" className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {searchError}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMode('search')}>
                  Отмена
                </Button>
                <Button onClick={handleCreateTask} disabled={!newTitle.trim() || !selectedProjectId}>
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