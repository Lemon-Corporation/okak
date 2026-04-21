'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import { formatRelativeDate, cn } from '@/lib/utils'
import type { Task } from '@/lib/types'
import {
  Plus,
  Search,
  CheckSquare,
  MoreHorizontal,
  Trash2,
  Calendar,
  Flag,
} from 'lucide-react'

type TaskStatus = Task['status']
type TaskPriority = Task['priority']

const statusLabels: Record<TaskStatus, string> = {
  'todo': 'К выполнению',
  'in-progress': 'В работе',
  'done': 'Выполнено',
}

const priorityLabels: Record<TaskPriority, string> = {
  'low': 'Низкий',
  'medium': 'Средний',
  'high': 'Высокий',
}

const priorityColors: Record<TaskPriority, string> = {
  'low': 'bg-green-500',
  'medium': 'bg-yellow-500',
  'high': 'bg-red-500',
}

export default function TasksPage() {
  const tasks = useAppStore((state) => state.tasks)
  const projects = useAppStore((state) => state.projects)
  const createTask = useAppStore((state) => state.createTask)
  const updateTask = useAppStore((state) => state.updateTask)
  const deleteTask = useAppStore((state) => state.deleteTask)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: null as string | null,
    priority: 'medium' as TaskPriority,
    dueDate: '',
  })

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const groupedTasks = {
    'todo': filteredTasks.filter((t) => t.status === 'todo'),
    'in-progress': filteredTasks.filter((t) => t.status === 'in-progress'),
    'done': filteredTasks.filter((t) => t.status === 'done'),
  }

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return null
    return projects.find((p) => p.id === projectId)?.name
  }

  const getProjectColor = (projectId: string | null) => {
    if (!projectId) return null
    return projects.find((p) => p.id === projectId)?.color
  }

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      createTask({
        title: newTask.title.trim(),
        description: newTask.description,
        projectId: newTask.projectId,
        status: 'todo',
        priority: newTask.priority,
        dueDate: newTask.dueDate || null,
        tags: [],
      })
      setNewTask({
        title: '',
        description: '',
        projectId: null,
        priority: 'medium',
        dueDate: '',
      })
      setIsCreateDialogOpen(false)
    }
  }

  const handleToggleStatus = (task: Task) => {
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done'
    updateTask(task.id, { status: newStatus })
  }

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTask(taskId, { status })
  }

  const handleDelete = (taskId: string) => {
    deleteTask(taskId)
  }

  const renderTaskItem = (task: Task) => {
    const projectName = getProjectName(task.projectId)
    const projectColor = getProjectColor(task.projectId)

    return (
      <div
        key={task.id}
        className={cn(
          'group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-blue/5 hover:border-blue-400',
          task.status === 'done' && 'opacity-60'
        )}
      >
        <Checkbox
          checked={task.status === 'done'}
          onCheckedChange={() => handleToggleStatus(task)}
          className="mt-0.5 border-blue-400"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-medium text-foreground',
                task.status === 'done' && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </span>
            <div className={cn('h-2 w-2 rounded-full', priorityColors[task.priority])} />
          </div>
          {task.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
              {task.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
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
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => handleDelete(task.id)}
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
    <div className="flex flex-col">
      <PageHeader
        title="Задачи"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Новая задача
          </Button>
        }
      />

      <main className="flex-1 p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск задач..."
              className="pl-9"
            />
          </div>
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value as TaskStatus | 'all')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр по статусу" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все задачи</SelectItem>
              <SelectItem value="todo">К выполнению</SelectItem>
              <SelectItem value="in-progress">В работе</SelectItem>
              <SelectItem value="done">Выполнено</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-medium text-foreground">
              {searchQuery || filterStatus !== 'all' ? 'Задачи не найдены' : 'Нет задач'}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {searchQuery || filterStatus !== 'all'
                ? 'Попробуйте изменить фильтры'
                : 'Создайте первую задачу, чтобы начать'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Создать задачу
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {(['todo', 'in-progress', 'done'] as const).map((status) => (
              <Card key={status} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{statusLabels[status]}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {groupedTasks[status].length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  {groupedTasks[status].length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Нет задач
                    </p>
                  ) : (
                    groupedTasks[status].map(renderTaskItem)
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая задача</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Название</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Введите название задачи"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Описание</label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Описание задачи (опционально)"
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Проект</label>
                <Select
                  value={newTask.projectId || 'none'}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, projectId: value === 'none' ? null : value })
                  }
                >
                  <SelectTrigger>
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
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Приоритет</label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, priority: value as TaskPriority })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Низкий
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        Средний
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        Высокий
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Срок выполнения</label>
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateTask} disabled={!newTask.title.trim()}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
