'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'
import { PROJECT_COLORS, formatRelativeDate } from '@/lib/utils'
import {
  Plus,
  Search,
  FolderKanban,
  MoreHorizontal,
  Trash2,
  Pencil,
  StickyNote,
  CheckSquare,
  Files,
} from 'lucide-react'

export default function ProjectsPage() {
  const projects = useAppStore((state) => state.projects)
  const notes = useAppStore((state) => state.notes)
  const tasks = useAppStore((state) => state.tasks)
  const files = useAppStore((state) => state.files)
  const createProject = useAppStore((state) => state.createProject)
  const updateProject = useAppStore((state) => state.updateProject)
  const deleteProject = useAppStore((state) => state.deleteProject)

  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PROJECT_COLORS[0],
  })

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getProjectStats = (projectId: string) => ({
    notes: notes.filter((n) => n.projectId === projectId).length,
    tasks: tasks.filter((t) => t.projectId === projectId).length,
    files: files.filter((f) => f.projectId === projectId).length,
  })

  const handleCreateProject = () => {
    if (formData.name.trim()) {
      createProject({
        name: formData.name.trim(),
        description: formData.description,
        color: formData.color,
        icon: 'folder',
      })
      setFormData({ name: '', description: '', color: PROJECT_COLORS[0] })
      setIsCreateDialogOpen(false)
    }
  }

  const handleEditProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        color: project.color,
      })
      setEditingProject(projectId)
    }
  }

  const handleUpdateProject = () => {
    if (editingProject && formData.name.trim()) {
      updateProject(editingProject, {
        name: formData.name.trim(),
        description: formData.description,
        color: formData.color,
      })
      setFormData({ name: '', description: '', color: PROJECT_COLORS[0] })
      setEditingProject(null)
    }
  }

  const handleDelete = (projectId: string) => {
    deleteProject(projectId)
  }

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false)
    setEditingProject(null)
    setFormData({ name: '', description: '', color: PROJECT_COLORS[0] })
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Проекты"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Новый проект
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
              placeholder="Поиск проектов..."
              className="pl-9"
            />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium text-foreground">
              {searchQuery ? 'Проекты не найдены' : 'Нет проектов'}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {searchQuery
                ? 'Попробуйте изменить запрос поиска'
                : 'Создайте первый проект для организации работы'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Создать проект
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const stats = getProjectStats(project.id)
              return (
                <Card key={project.id} className="group relative transition-shadow hover:border-blue-600">
                  <Link href={`/projects/${project.id}`} className="block">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${project.color}20` }}
                        >
                          <FolderKanban
                            className="h-5 w-5"
                            style={{ color: project.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{project.name}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            {project.description || 'Без описания'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <StickyNote className="h-3.5 w-3.5" />
                          {stats.notes}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckSquare className="h-3.5 w-3.5" />
                          {stats.tasks}
                        </span>
                        <span className="flex items-center gap-1">
                          <Files className="h-3.5 w-3.5" />
                          {stats.files}
                        </span>
                        <span className="ml-auto">
                          {formatRelativeDate(project.updatedAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Link>
                  <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditProject(project.id)}>
                          <Pencil className="h-4 w-4" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <Dialog open={isCreateDialogOpen || !!editingProject} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Редактировать проект' : 'Новый проект'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Название</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Название проекта"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Описание</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Краткое описание (опционально)"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Цвет</label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                      formData.color === color ? 'ring-2 ring-foreground ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Отмена
            </Button>
            <Button
              onClick={editingProject ? handleUpdateProject : handleCreateProject}
              disabled={!formData.name.trim()}
            >
              {editingProject ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
