'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/types'
import {
  Plus,
  Search,
  CheckSquare,
  MoreHorizontal,
  Trash2,
  Calendar,
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
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

const monthNames = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const getLocalDateOnly = (dateValue: string) => {
  const [year, month, day] = dateValue.slice(0, 10).split('-').map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

const getDeadlineLabel = (dueDate: string | null) => {
  if (!dueDate) {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const deadline = getLocalDateOnly(dueDate)

  if (!deadline) {
    return null
  }

  deadline.setHours(0, 0, 0, 0)

  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      text: 'Просрочено',
      className: 'border-destructive/20 bg-destructive/10 text-destructive',
    }
  }

  if (diffDays === 0) {
    return {
      text: 'Дедлайн сегодня',
      className: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-700',
    }
  }

  if (diffDays === 1) {
    return {
      text: 'До дедлайна: 1 день',
      className: 'border-blue-500/20 bg-blue-500/10 text-blue-700',
    }
  }

  if (diffDays >= 2 && diffDays <= 4) {
    return {
      text: `До дедлайна: ${diffDays} дня`,
      className: 'border-blue-500/20 bg-blue-500/10 text-blue-700',
    }
  }

  return {
    text: `До дедлайна: ${diffDays} дней`,
    className: 'border-blue-500/20 bg-blue-500/10 text-blue-700',
  }
}

const formatDateForField = (dateValue: string | null) => {
  if (!dateValue) {
    return ''
  }

  const date = getLocalDateOnly(dateValue)

  if (!date) {
    return ''
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

const formatDateTyping = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`
}

const normalizeDateForBackend = (value: string) => {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const displayMatch = trimmedValue.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)

  if (displayMatch) {
    const [, day, month, year] = displayMatch
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day))

    if (
      parsedDate.getFullYear() !== Number(year) ||
      parsedDate.getMonth() !== Number(month) - 1 ||
      parsedDate.getDate() !== Number(day)
    ) {
      return null
    }

    return `${year}-${month}-${day}`
  }

  const isoMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (isoMatch) {
    return trimmedValue
  }

  return null
}

const formatDateFromDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

const getDateFromFieldValue = (value: string) => {
  const normalizedDate = normalizeDateForBackend(value)

  if (!normalizedDate) {
    return null
  }

  return getLocalDateOnly(normalizedDate)
}

const isSameDate = (firstDate: Date, secondDate: Date) =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth() &&
  firstDate.getDate() === secondDate.getDate()

export default function TasksPage() {
  const tasks = useAppStore((state) => state.tasks)
  const projects = useAppStore((state) => state.projects)
  const createTask = useAppStore((state) => state.createTask)
  const loading = useAppStore((state) => state.loading.tasks)
  const loadError = useAppStore((state) => state.errors.tasks)
  const loadTasks = useAppStore((state) => state.loadTasks)
  const updateTask = useAppStore((state) => state.updateTask)
  const deleteTask = useAppStore((state) => state.deleteTask)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null)
  const [openCalendarFor, setOpenCalendarFor] = useState<'create' | 'edit' | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: projects[0]?.id ?? null,
    priority: 'medium' as TaskPriority,
    dueDate: '',
  })

  const [editingTask, setEditingTask] = useState<{
    id: string
    title: string
    description: string
    projectId: string | null
    status: TaskStatus
    priority: TaskPriority
    dueDate: string
  } | null>(null)

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === 'all' || task.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const groupedTasks = {
    todo: filteredTasks.filter((task) => task.status === 'todo'),
    'in-progress': filteredTasks.filter((task) => task.status === 'in-progress'),
    done: filteredTasks.filter((task) => task.status === 'done'),
  }

  const visibleStatuses: TaskStatus[] =
    filterStatus === 'all'
      ? ['todo', 'in-progress', 'done']
      : [filterStatus]

  const isSearchMode = searchQuery.trim().length > 0

  const getProjectName = (projectId: string | null) => {
    if (!projectId) {
      return null
    }

    return projects.find((project) => project.id === projectId)?.name
  }

  const getProjectColor = (projectId: string | null) => {
    if (!projectId) {
      return null
    }

    return projects.find((project) => project.id === projectId)?.color
  }

  const handleOpenCreateTask = () => {
    setActionError('')
    setOpenCalendarFor(null)
    setNewTask({
      title: '',
      description: '',
      projectId: projects[0]?.id ?? null,
      priority: 'medium',
      dueDate: '',
    })
    setIsCreateDialogOpen(true)
  }

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      return
    }

    const normalizedDueDate = normalizeDateForBackend(newTask.dueDate)

    if (newTask.dueDate.trim() && !normalizedDueDate) {
      setActionError('Введите дедлайн в формате дд.мм.гггг')
      return
    }

    setActionError('')
    setIsSaving(true)

    try {
      await createTask({
        title: newTask.title.trim(),
        description: newTask.description,
        projectId: newTask.projectId,
        status: 'todo',
        priority: newTask.priority,
        dueDate: normalizedDueDate,
        tags: [],
      })

      setNewTask({
        title: '',
        description: '',
        projectId: projects[0]?.id ?? null,
        priority: 'medium',
        dueDate: '',
      })

      setIsCreateDialogOpen(false)
      setOpenCalendarFor(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Не удалось создать задачу')
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenEditTask = (task: Task) => {
    setActionError('')
    setOpenCalendarFor(null)
    setEditingTask({
      id: task.id,
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      status: task.status,
      priority: task.priority,
      dueDate: formatDateForField(task.dueDate),
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateTask = async () => {
    if (!editingTask || !editingTask.title.trim()) {
      return
    }

    const normalizedDueDate = normalizeDateForBackend(editingTask.dueDate)

    if (editingTask.dueDate.trim() && !normalizedDueDate) {
      setActionError('Введите дедлайн в формате дд.мм.гггг')
      return
    }

    setActionError('')
    setIsSaving(true)

    try {
      await updateTask(editingTask.id, {
        title: editingTask.title.trim(),
        description: editingTask.description,
        priority: editingTask.priority,
        dueDate: normalizedDueDate,
      })

      setIsEditDialogOpen(false)
      setEditingTask(null)
      setOpenCalendarFor(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Не удалось изменить задачу')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    setActionError('')

    try {
      await updateTask(taskId, { status })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Не удалось изменить статус задачи')
    }
  }

  const handleAutoScrollWhileDragging = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault()

    const edgeSize = 120
    const scrollSpeed = 18
    const pointerY = event.clientY
    const windowHeight = window.innerHeight

    if (pointerY < edgeSize) {
      window.scrollBy({ top: -scrollSpeed, behavior: 'auto' })
    }

    if (pointerY > windowHeight - edgeSize) {
      window.scrollBy({ top: scrollSpeed, behavior: 'auto' })
    }
  }

  const handleDropTask = async (status: TaskStatus) => {
    if (!draggedTaskId) {
      return
    }

    const task = tasks.find((item) => item.id === draggedTaskId)

    if (!task || task.status === status) {
      setDraggedTaskId(null)
      return
    }

    await handleStatusChange(draggedTaskId, status)
    setDraggedTaskId(null)
  }

  const handleDelete = async (taskId: string) => {
    setActionError('')

    try {
      await deleteTask(taskId)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Не удалось удалить задачу')
    }
  }

  const renderCalendarPicker = (
    selectedValue: string,
    onSelect: (value: string) => void
  ) => {
    const selectedDate = getDateFromFieldValue(selectedValue)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7
    const startDate = new Date(year, month, 1 - startOffset)

    const days = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + index)
      return date
    })

    return (
      <div className="absolute bottom-full left-1/2 z-[100] mb-2 w-72 -translate-x-1/2 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-sm font-medium">
            {monthNames[month]} {year}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-1 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date) => {
            const isCurrentMonth = date.getMonth() === month
            const isToday = isSameDate(date, today)
            const isSelected = selectedDate ? isSameDate(date, selectedDate) : false

            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => {
                  onSelect(formatDateFromDate(date))
                  setOpenCalendarFor(null)
                }}
                className={cn(
                  'flex h-9 items-center justify-center rounded-lg text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                  !isCurrentMonth && 'text-muted-foreground/40',
                  isToday && 'border border-blue-500/40',
                  isSelected && 'bg-blue-600 text-white hover:bg-blue-600 hover:text-white'
                )}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>

        <div className="mt-3 flex justify-between gap-2 border-t pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onSelect(formatDateFromDate(today))
              setCalendarMonth(today)
              setOpenCalendarFor(null)
            }}
          >
            Сегодня
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onSelect('')
              setOpenCalendarFor(null)
            }}
          >
            Очистить
          </Button>
        </div>
      </div>
    )
  }

  const renderTaskItem = (task: Task) => {
    const projectName = getProjectName(task.projectId)
    const projectColor = getProjectColor(task.projectId)
    const deadline = getDeadlineLabel(task.dueDate)

    return (
      <div
        key={task.id}
        draggable
        onClick={() => handleOpenEditTask(task)}
        onDragStart={() => setDraggedTaskId(task.id)}
        onDragEnd={() => setDraggedTaskId(null)}
        onDragOver={handleAutoScrollWhileDragging}
        className={cn(
          'group flex min-w-0 cursor-pointer items-start overflow-hidden rounded-lg border border-border bg-card p-4 transition-colors hover:border-blue-400 hover:bg-blue/5',
          'active:cursor-grabbing',
          draggedTaskId === task.id && 'opacity-50',
          task.status === 'done' && 'opacity-60'
        )}
      >
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 items-start gap-2">
            <span
              className={cn(
                'mt-1 h-2.5 w-2.5 shrink-0 rounded-full',
                statusColors[task.status]
              )}
              title={statusLabels[task.status]}
            />

            <span
              className={cn(
                'min-w-0 break-all font-medium text-foreground line-clamp-2',
                task.status === 'done' && 'text-muted-foreground line-through'
              )}
            >
              {task.title}
            </span>
          </div>

          {task.description && (
            <p className="mt-1 min-w-0 break-all text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 overflow-hidden">
            {projectName && (
              <span
                className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                style={{
                  backgroundColor: `${projectColor}20`,
                  color: projectColor || undefined,
                }}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: projectColor || undefined }}
                />
                <span className="min-w-0 truncate">{projectName}</span>
              </span>
            )}

            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', priorityColors[task.priority])} />
              <span className="truncate">Приоритет: {priorityLabels[task.priority]}</span>
            </span>

            {deadline && (
              <span
                className={cn(
                  'inline-flex max-w-full items-center gap-1 rounded-full border px-2 py-0.5 text-xs',
                  deadline.className
                )}
              >
                <Calendar className="h-3 w-3 shrink-0" />
                <span className="truncate">{deadline.text}</span>
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="ml-2 shrink-0 opacity-0 group-hover:opacity-100"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            onClick={(event) => event.stopPropagation()}
          >
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
              onClick={() => setTaskToDelete({ id: task.id, title: task.title })}
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
          <Button onClick={handleOpenCreateTask}>
            <Plus className="h-4 w-4" />
            Новая задача
          </Button>
        }
      />

      <main className="flex-1 overflow-hidden p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
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

        {actionError && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            {actionError}
          </div>
        )}

        {loadError && tasks.length === 0 ? (
          <div role="alert" className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-destructive/70" />
            <h3 className="mb-2 text-lg font-medium text-foreground">
              Не удалось загрузить задачи
            </h3>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">{loadError}</p>
            <Button variant="outline" onClick={() => loadTasks()}>
              Повторить
            </Button>
          </div>
        ) : loading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Loader2 className="mb-4 h-8 w-8 animate-spin" />
            <p className="text-sm">Загружаем задачи...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
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
              <Button onClick={handleOpenCreateTask}>
                <Plus className="h-4 w-4" />
                Создать задачу
              </Button>
            )}
          </div>
        ) : isSearchMode ? (
          <div className="min-w-0 rounded-xl border bg-card">
            <div className="border-b px-4 py-3">
              <h3 className="text-base font-medium text-foreground">
                Результаты поиска
              </h3>
              <p className="text-sm text-muted-foreground">
                Найдено задач: {filteredTasks.length}
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-3 p-4">
              {filteredTasks.map(renderTaskItem)}
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'grid min-w-0 gap-6',
              filterStatus === 'all'
                ? 'lg:grid-cols-[repeat(3,minmax(0,1fr))]'
                : 'lg:grid-cols-1'
            )}
          >
            {visibleStatuses.map((status) => (
              <Card
                key={status}
                onDragOver={handleAutoScrollWhileDragging}
                onDrop={() => {
                  void handleDropTask(status)
                }}
                className={cn(
                  'min-w-0 overflow-hidden transition-colors',
                  draggedTaskId && 'border-blue-400/60 bg-blue/5'
                )}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex min-w-0 items-center justify-between gap-3 text-base">
                    <span className="min-w-0 truncate">{statusLabels[status]}</span>
                    <span className="shrink-0 text-sm font-normal text-muted-foreground">
                      {groupedTasks[status].length}
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex min-h-[160px] min-w-0 flex-1 flex-col gap-3 overflow-hidden">
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
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="overflow-visible">
          <DialogHeader>
            <DialogTitle>Новая задача</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Название</label>
              <Input
                value={newTask.title}
                onChange={(event) => setNewTask({ ...newTask, title: event.target.value })}
                placeholder="Введите название задачи"
                disabled={isSaving}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Описание</label>
              <Textarea
                value={newTask.description}
                onChange={(event) =>
                  setNewTask({ ...newTask, description: event.target.value })
                }
                placeholder="Описание задачи (опционально)"
                rows={3}
                disabled={isSaving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Проект</label>
                <Select
                  value={newTask.projectId || ''}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, projectId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите проект" />
                  </SelectTrigger>
                  <SelectContent>
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
              <label className="text-sm font-medium">Дедлайн</label>
              <div className="relative">
                <div className="relative rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                  <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={newTask.dueDate}
                    onClick={() => {
                      setOpenCalendarFor(openCalendarFor === 'create' ? null : 'create')
                      setCalendarMonth(getDateFromFieldValue(newTask.dueDate) ?? new Date())
                    }}
                    onChange={(event) =>
                      setNewTask({ ...newTask, dueDate: formatDateTyping(event.target.value) })
                    }
                    placeholder="дд.мм.гггг"
                    className="border-0 bg-transparent pl-9 pr-10 shadow-none focus-visible:ring-0"
                  />
                  {newTask.dueDate && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => setNewTask({ ...newTask, dueDate: '' })}
                      aria-label="Очистить дедлайн"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {openCalendarFor === 'create' &&
                  renderCalendarPicker(newTask.dueDate, (value) =>
                    setNewTask({ ...newTask, dueDate: value })
                  )}
              </div>
            </div>
          </div>

          {actionError && (
            <p role="alert" className="text-sm text-destructive">
              {actionError}
            </p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setOpenCalendarFor(null)
              }}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!newTask.title.trim() || !newTask.projectId || isSaving}
            >
              {isSaving ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)

          if (!open) {
            setEditingTask(null)
            setOpenCalendarFor(null)
          }
        }}
      >
        <DialogContent className="max-w-xl overflow-visible">
          <DialogHeader>
            <DialogTitle>Задача</DialogTitle>
          </DialogHeader>

          {editingTask && (
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Название</label>
                <Input
                  value={editingTask.title}
                  onChange={(event) =>
                    setEditingTask({ ...editingTask, title: event.target.value })
                  }
                  placeholder="Введите название задачи"
                  disabled={isSaving}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Полное описание</label>
                <Textarea
                  value={editingTask.description}
                  onChange={(event) =>
                    setEditingTask({ ...editingTask, description: event.target.value })
                  }
                  placeholder="Описание задачи"
                  rows={6}
                  disabled={isSaving}
                  className="min-h-[140px] resize-y"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Приоритет</label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value) =>
                      setEditingTask({ ...editingTask, priority: value as TaskPriority })
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

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Дедлайн</label>
                  <div className="relative">
                    <div className="relative rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        value={editingTask.dueDate}
                        onClick={() => {
                          setOpenCalendarFor(openCalendarFor === 'edit' ? null : 'edit')
                          setCalendarMonth(getDateFromFieldValue(editingTask.dueDate) ?? new Date())
                        }}
                        onChange={(event) =>
                          setEditingTask({
                            ...editingTask,
                            dueDate: formatDateTyping(event.target.value),
                          })
                        }
                        placeholder="дд.мм.гггг"
                        className="border-0 bg-transparent pl-9 pr-10 shadow-none focus-visible:ring-0"
                      />
                      {editingTask.dueDate && (
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          onClick={() => setEditingTask({ ...editingTask, dueDate: '' })}
                          aria-label="Очистить дедлайн"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {openCalendarFor === 'edit' &&
                      renderCalendarPicker(editingTask.dueDate, (value) =>
                        setEditingTask({ ...editingTask, dueDate: value })
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {actionError && (
            <p role="alert" className="text-sm text-destructive">
              {actionError}
            </p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingTask(null)
                setOpenCalendarFor(null)
              }}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button
              onClick={handleUpdateTask}
              disabled={!editingTask?.title.trim() || isSaving}
            >
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(taskToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setTaskToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить задачу?</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              Задача «{taskToDelete?.title}» будет удалена. Это действие нельзя отменить.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTaskToDelete(null)}
            >
              Отмена
            </Button>
            <Button
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                if (!taskToDelete) {
                  return
                }

                void handleDelete(taskToDelete.id)
                setTaskToDelete(null)
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