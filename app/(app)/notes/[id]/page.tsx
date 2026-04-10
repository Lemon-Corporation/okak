'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'
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
  const [projectId, setProjectId] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setProjectId(note.projectId)
      setTags(note.tags)
    }
  }, [note])

  // Auto-save debounced
  useEffect(() => {
    if (!note) return

    const timeout = setTimeout(() => {
      if (
        title !== note.title ||
        content !== note.content ||
        projectId !== note.projectId ||
        JSON.stringify(tags) !== JSON.stringify(note.tags)
      ) {
        updateNote(noteId, { title, content, projectId, tags })
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [title, content, projectId, tags, noteId, note, updateNote])

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

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
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
              <Select
                value={projectId || 'none'}
                onValueChange={(value) => setProjectId(value === 'none' ? null : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Выберите проект" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без проекта</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div
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
