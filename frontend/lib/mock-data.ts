import type { Note, Task, Project, FileItem } from './types'

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Веб-разработка',
    description: 'Проекты по веб-разработке и фронтенду',
    color: '#3b82f6',
    icon: 'code',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'proj-2',
    name: 'Маркетинг',
    description: 'Маркетинговые кампании и стратегии',
    color: '#22c55e',
    icon: 'target',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T11:00:00Z',
  },
  {
    id: 'proj-3',
    name: 'Личное',
    description: 'Личные заметки и планы',
    color: '#8b5cf6',
    icon: 'heart',
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-15T16:00:00Z',
  },
]

export const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Идеи для нового проекта',
    content: 'Создать приложение для управления заметками с overlay интерфейсом. Основные фичи:\n\n- Быстрый доступ через горячие клавиши\n- Поиск по всем сущностям\n- Drag & Drop файлов\n- Темная тема',
    projectId: 'proj-1',
    tags: ['идеи', 'проект'],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    isPinned: true,
  },
  {
    id: 'note-2',
    title: 'Встреча с командой',
    content: 'Обсудить:\n1. Прогресс по текущим задачам\n2. Планы на следующий спринт\n3. Технические блокеры',
    projectId: 'proj-1',
    tags: ['встреча', 'команда'],
    createdAt: '2024-01-19T14:00:00Z',
    updatedAt: '2024-01-19T14:00:00Z',
    isPinned: false,
  },
  {
    id: 'note-3',
    title: 'Контент-план на февраль',
    content: '- 4 поста в блог\n- 8 постов в соцсетях\n- 2 email-рассылки\n- 1 вебинар',
    projectId: 'proj-2',
    tags: ['контент', 'планирование'],
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-18T09:00:00Z',
    isPinned: false,
  },
  {
    id: 'note-4',
    title: 'Список книг на прочтение',
    content: '1. "Чистый код" - Роберт Мартин\n2. "Рефакторинг" - Мартин Фаулер\n3. "Шаблоны проектирования" - GoF',
    projectId: 'proj-3',
    tags: ['книги', 'обучение'],
    createdAt: '2024-01-15T20:00:00Z',
    updatedAt: '2024-01-15T20:00:00Z',
    isPinned: false,
  },
]

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Разработать UI компоненты',
    description: 'Создать базовые UI компоненты для приложения: кнопки, инпуты, карточки',
    projectId: 'proj-1',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2024-02-01T00:00:00Z',
    tags: ['ui', 'разработка'],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'task-2',
    title: 'Настроить CI/CD',
    description: 'Настроить автоматическое развертывание на Vercel',
    projectId: 'proj-1',
    status: 'todo',
    priority: 'medium',
    dueDate: '2024-02-05T00:00:00Z',
    tags: ['devops', 'ci'],
    createdAt: '2024-01-19T11:00:00Z',
    updatedAt: '2024-01-19T11:00:00Z',
  },
  {
    id: 'task-3',
    title: 'Подготовить презентацию',
    description: 'Презентация для инвесторов о новом продукте',
    projectId: 'proj-2',
    status: 'todo',
    priority: 'high',
    dueDate: '2024-01-25T00:00:00Z',
    tags: ['презентация', 'важно'],
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-18T09:00:00Z',
  },
  {
    id: 'task-4',
    title: 'Записаться в спортзал',
    description: 'Найти спортзал рядом с домом и записаться на абонемент',
    projectId: 'proj-3',
    status: 'done',
    priority: 'low',
    dueDate: null,
    tags: ['здоровье'],
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 'task-5',
    title: 'Написать документацию API',
    description: 'Документировать все эндпоинты REST API',
    projectId: 'proj-1',
    status: 'todo',
    priority: 'medium',
    dueDate: '2024-02-10T00:00:00Z',
    tags: ['документация', 'api'],
    createdAt: '2024-01-17T15:00:00Z',
    updatedAt: '2024-01-17T15:00:00Z',
  },
]

export const mockFiles: FileItem[] = [
  {
    id: 'file-1',
    name: 'design-mockup.png',
    type: 'image/png',
    size: 2457600,
    url: '/files/design-mockup.png',
    projectId: 'proj-1',
    tags: ['дизайн', 'mockup'],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'file-2',
    name: 'requirements.pdf',
    type: 'application/pdf',
    size: 1048576,
    url: '/files/requirements.pdf',
    projectId: 'proj-1',
    tags: ['документация'],
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-18T14:00:00Z',
  },
  {
    id: 'file-3',
    name: 'marketing-strategy.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 524288,
    url: '/files/marketing-strategy.docx',
    projectId: 'proj-2',
    tags: ['стратегия', 'документ'],
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
  },
  {
    id: 'file-4',
    name: 'budget-2024.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 262144,
    url: '/files/budget-2024.xlsx',
    projectId: 'proj-2',
    tags: ['бюджет', 'финансы'],
    createdAt: '2024-01-12T09:00:00Z',
    updatedAt: '2024-01-12T09:00:00Z',
  },
]

export function seedMockData(store: {
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task
  createFile: (file: Omit<FileItem, 'id' | 'createdAt' | 'updatedAt'>) => FileItem
  projects: Project[]
}) {
  // Only seed if empty
  if (store.projects.length > 0) return

  // Create projects first
  const projectMap = new Map<string, string>()
  mockProjects.forEach((p) => {
    const created = store.createProject({
      name: p.name,
      description: p.description,
      color: p.color,
      icon: p.icon,
    })
    projectMap.set(p.id, created.id)
  })

  // Create notes with mapped project IDs
  mockNotes.forEach((n) => {
    store.createNote({
      title: n.title,
      content: n.content,
      projectId: n.projectId ? projectMap.get(n.projectId) || null : null,
      tags: n.tags,
      isPinned: n.isPinned,
    })
  })

  // Create tasks
  mockTasks.forEach((t) => {
    store.createTask({
      title: t.title,
      description: t.description,
      projectId: t.projectId ? projectMap.get(t.projectId) || null : null,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      tags: t.tags,
    })
  })

  // Create files
  mockFiles.forEach((f) => {
    store.createFile({
      name: f.name,
      type: f.type,
      size: f.size,
      url: f.url,
      projectId: f.projectId ? projectMap.get(f.projectId) || null : null,
      tags: f.tags,
    })
  })
}
