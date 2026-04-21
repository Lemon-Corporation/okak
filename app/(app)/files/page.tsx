'use client'

import { useState, useCallback } from 'react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
import { formatFileSize, formatRelativeDate, getFileIcon, cn } from '@/lib/utils'
import {
  Search,
  Upload,
  Files,
  MoreHorizontal,
  Trash2,
  Download,
  Image,
  FileText,
  FileVideo,
  FileAudio,
  Archive,
  Code,
  File,
  Grid3X3,
  List,
} from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  'image': Image,
  'video': FileVideo,
  'audio': FileAudio,
  'pdf': FileText,
  'doc': FileText,
  'sheet': FileText,
  'presentation': FileText,
  'archive': Archive,
  'code': Code,
  'file': File,
}

export default function FilesPage() {
  const files = useAppStore((state) => state.files)
  const projects = useAppStore((state) => state.projects)
  const createFile = useAppStore((state) => state.createFile)
  const deleteFile = useAppStore((state) => state.deleteFile)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterProject, setFilterProject] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isDragging, setIsDragging] = useState(false)

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProject = filterProject === 'all' || file.projectId === filterProject
    return matchesSearch && matchesProject
  })

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return null
    return projects.find((p) => p.id === projectId)?.name
  }

  const getProjectColor = (projectId: string | null) => {
    if (!projectId) return null
    return projects.find((p) => p.id === projectId)?.color
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    droppedFiles.forEach((file) => {
      createFile({
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        projectId: filterProject !== 'all' ? filterProject : null,
        tags: [],
      })
    })
  }, [createFile, filterProject])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    selectedFiles.forEach((file) => {
      createFile({
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        projectId: filterProject !== 'all' ? filterProject : null,
        tags: [],
      })
    })
  }

  const handleDelete = (fileId: string) => {
    deleteFile(fileId)
  }

  const renderFileCard = (file: typeof files[0]) => {
    const iconType = getFileIcon(file.type)
    const IconComponent = iconMap[iconType] || File
    const projectName = getProjectName(file.projectId)
    const projectColor = getProjectColor(file.projectId)

    if (viewMode === 'list') {
      return (
        <div
          key={file.id}
          className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <IconComponent className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{file.name}</p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{formatFileSize(file.size)}</span>
              {projectName && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                  style={{
                    backgroundColor: `${projectColor}20`,
                    color: projectColor || undefined,
                  }}
                >
                  {projectName}
                </span>
              )}
              <span>{formatRelativeDate(file.updatedAt)}</span>
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
              <DropdownMenuItem>
                <Download className="h-4 w-4" />
                Скачать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(file.id)}
              >
                <Trash2 className="h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }

    return (
      <Card key={file.id} className="group relative transition-shadow hover:border-blue-600">
        <CardContent className="p-4">
          <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-muted">
            {file.type.startsWith('image/') ? (
              <div
                className="h-full w-full rounded-lg bg-cover bg-center"
                style={{ backgroundImage: `url(${file.url})` }}
              />
            ) : (
              <IconComponent className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <p className="font-medium text-foreground truncate">{file.name}</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
            {projectName && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                style={{
                  backgroundColor: `${projectColor}20`,
                  color: projectColor || undefined,
                }}
              >
                {projectName}
              </span>
            )}
          </div>
        </CardContent>
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="h-4 w-4" />
                Скачать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(file.id)}
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
        title="Файлы"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <label>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
              <Button asChild>
                <span>
                  <Upload className="h-4 w-4" />
                  Загрузить
                </span>
              </Button>
            </label>
          </div>
        }
      />

      <main className="flex-1 p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск файлов..."
              className="pl-9"
            />
          </div>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Все проекты" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все проекты</SelectItem>
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

        <div
          className={cn(
            'mb-6 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-muted-foreground/50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Перетащите файлы сюда или{' '}
            <label className="cursor-pointer text-primary underline">
              выберите
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInput}
              />
            </label>
          </p>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Files className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium text-foreground">
              {searchQuery || filterProject !== 'all' ? 'Файлы не найдены' : 'Нет файлов'}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {searchQuery || filterProject !== 'all'
                ? 'Попробуйте изменить фильтры'
                : 'Загрузите первый файл, чтобы начать'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredFiles.map(renderFileCard)}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredFiles.map(renderFileCard)}
          </div>
        )}
      </main>
    </div>
  )
}
