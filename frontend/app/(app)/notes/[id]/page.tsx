'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'
import { tagsApi, notesApi } from '@/lib/api'
import type { BackendTag } from '@/lib/api/tags'
import { formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  MoreHorizontal,
  Pin,
  PinOff,
  Trash2,
  Tag,
  X,
} from 'lucide-react'

export default function NoteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const noteId = params.id as string

  const notes = useAppStore((state) => state.notes)
  const projects = useAppStore((state) => state.projects)
  const updateNote = useAppStore((state) => state.updateNote)
  const deleteNote = useAppStore((state) => state.deleteNote)

  const note = notes.find((n) => n.id === noteId)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [allTags, setAllTags] = useState<BackendTag[]>([])

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setTags(note.tags)
    }
  }, [note])

  // Load all tags on mount
  useEffect(() => {
    tagsApi.list().then((res) => setAllTags(res.items)).catch(() => {})
  }, [noteId])

  // Auto-save debounced (title/content only — tags sync via separate APIs)
  useEffect(() => {
    if (!note) return

    const timeout = setTimeout(() => {
      if (
        title !== note.title ||
        content !== note.content
      ) {
        updateNote(noteId, { title, content })
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [title, content, noteId, note, updateNote])

  if (!note) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Заметка не найдена" />
        <main className="flex flex-1 flex-col items-center justify-center p-6">
          <p className="mb-4 text-muted-foreground">Эта заметка не существует или была удалена</p>
          <Button onClick={() => router.push('/notes')}>
            <ArrowLeft className="h-4 w-4" />
            Вернуться к заметкам
          </Button>
        </main>
      </div>
    )
  }

  const handleTogglePin = () => {
    updateNote(noteId, { isPinned: !note.isPinned })
  }

  const handleDelete = () => {
    deleteNote(noteId)
    router.push('/notes')
  }

  const handleAddTag = async () => {
    const name = newTag.trim()
    if (!name || tags.includes(name)) return

    let tag = allTags.find((t) => t.name === name)
    if (!tag) {
      try {
        const created = await tagsApi.create({ name, color: '#3b82f6' })
        tag = created
        setAllTags((prev) => [...prev, created])
      } catch {
        return
      }
    }
    if (!tag) return

    try {
      await notesApi.addTag(noteId, tag.id)
      setTags((prev) => [...prev, name])
      setNewTag('')
    } catch {}
  }

  const handleRemoveTag = async (tagToRemove: string) => {
    const tag = allTags.find((t) => t.name === tagToRemove)
    if (!tag) return
    try {
      await notesApi.removeTag(noteId, tag.id)
      setTags((prev) => prev.filter((t) => t !== tagToRemove))
    } catch {}
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Заметка"
        breadcrumbs={[
          { title: 'Заметки', href: '/notes' },
          { title: note.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleTogglePin}>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl p-6">
          <div className="mb-6">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название заметки"
              className="border-0 bg-transparent px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
            />
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>Создано: {formatDate(note.createdAt)}</span>
              <span>Изменено: {formatDate(note.updatedAt)}</span>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Проект:</span>
              <span className="text-sm font-medium">
                {projects.find((p) => p.id === note.projectId)?.name || 'Без проекта'}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Теги:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 rounded-full hover:bg-foreground/10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="Добавить тег..."
                  className="h-8 w-32"
                />
              </div>
            </div>
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Начните писать..."
            className="min-h-[400px] resize-none border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
          />
        </div>
      </main>
    </div>
  )
}