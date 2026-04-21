'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'
import { formatRelativeDate } from '@/lib/utils'
import {
  Plus,
  Search,
  StickyNote,
  Pin,
  MoreHorizontal,
  Trash2,
  PinOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NotesPage() {
  const router = useRouter()
  const notes = useAppStore((state) => state.notes)
  const projects = useAppStore((state) => state.projects)
  const createNote = useAppStore((state) => state.createNote)
  const updateNote = useAppStore((state) => state.updateNote)
  const deleteNote = useAppStore((state) => state.deleteNote)
  
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned)
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned)

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return null
    return projects.find((p) => p.id === projectId)?.name
  }

  const getProjectColor = (projectId: string | null) => {
    if (!projectId) return null
    return projects.find((p) => p.id === projectId)?.color
  }

  const handleCreateNote = () => {
    const note = createNote({
      title: 'Новая заметка',
      content: '',
      projectId: null,
      tags: [],
      isPinned: false,
    })
    router.push(`/notes/${note.id}`)
  }

  const handleTogglePin = (id: string, isPinned: boolean) => {
    updateNote(id, { isPinned: !isPinned })
  }

  const handleDelete = (id: string) => {
    deleteNote(id)
  }

  const renderNoteCard = (note: typeof notes[0]) => {
    const projectName = getProjectName(note.projectId)
    const projectColor = getProjectColor(note.projectId)

    return (
      <Card
        key={note.id}
        className="group relative transition-shadow hover:border-blue-600"
      >
        <Link href={`/notes/${note.id}`} className="block">
          <CardContent className="p-4">
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                {note.isPinned && (
                  <Pin className="h-3 w-3 text-muted-foreground" />
                )}
                <h3 className="font-medium text-foreground line-clamp-1">
                  {note.title}
                </h3>
              </div>
            </div>
            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
              {note.content || 'Пустая заметка'}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {projectName && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: `${projectColor}20`,
                      color: projectColor || undefined,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: projectColor || undefined }}
                    />
                    {projectName}
                  </span>
                )}
                {note.tags.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {note.tags.slice(0, 2).join(', ')}
                    {note.tags.length > 2 && ` +${note.tags.length - 2}`}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatRelativeDate(note.updatedAt)}
              </span>
            </div>
          </CardContent>
        </Link>
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleTogglePin(note.id, note.isPinned)}>
                {note.isPinned ? (
                  <>
                    <PinOff className="h-4 w-4" />
                    Открепить
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4" />
                    Закрепить
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(note.id)}
              >
                <Trash2 className="h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    )
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Заметки"
        actions={
          <Button onClick={handleCreateNote}>
            <Plus className="h-4 w-4" />
            Новая заметка
          </Button>
        }
      />

      <main className="flex-1 p-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск заметок..."
              className="pl-9"
            />
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <StickyNote className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium text-foreground">
              {searchQuery ? 'Заметки не найдены' : 'Нет заметок'}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {searchQuery
                ? 'Попробуйте изменить запрос поиска'
                : 'Создайте первую заметку, чтобы начать'}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateNote}>
                <Plus className="h-4 w-4" />
                Создать заметку
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {pinnedNotes.length > 0 && (
              <div>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Pin className="h-3 w-3" />
                  Закрепленные
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pinnedNotes.map(renderNoteCard)}
                </div>
              </div>
            )}

            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                    Другие заметки
                  </h2>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {unpinnedNotes.map(renderNoteCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
