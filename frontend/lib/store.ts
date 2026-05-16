'use client'

import { create } from 'zustand'
import type {
  Note,
  Task,
  Project,
  FileItem,
  User,
  CreateNote,
  CreateTask,
  CreateProject,
  UpdateNote,
  UpdateTask,
  UpdateProject,
} from './types'
import { now } from './utils'
import { authApi, projectsApi, notesApi, tasksApi, filesApi, tagsApi } from './api'
import type { BackendProject, BackendNote, BackendTask } from './api/dto'
import { PROJECT_COLORS } from './utils'

// --- mappers ---

function mapProject(p: BackendProject): Project {
  return {
    id: p.id,
    name: p.title,
    description: p.description ?? '',
    color: p.color || PROJECT_COLORS[0],
    icon: 'folder',
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }
}

function mapNote(n: BackendNote): Note {
  return {
    id: n.id,
    title: n.title,
    content: n.content ?? '',
    projectId: n.project_id,
    tags: n.tags.map((t) => t.name),
    isPinned: n.is_pinned,
    createdAt: n.created_at,
    updatedAt: n.updated_at,
  }
}

const backendStatusToFrontend: Record<string, Task['status']> = {
  todo: 'todo',
  in_progress: 'in-progress',
  done: 'done',
  backlog: 'todo',
  cancelled: 'todo',
}

const frontendStatusToBackend: Record<Task['status'], string> = {
  todo: 'todo',
  'in-progress': 'in_progress',
  done: 'done',
}

const backendPriorityToFrontend: Record<string, Task['priority']> = {
  none: 'low',
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'high',
}

const frontendPriorityToBackend: Record<Task['priority'], string> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
}

function mapTask(t: BackendTask): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? '',
    projectId: t.project_id,
    status: backendStatusToFrontend[t.status] ?? 'todo',
    priority: backendPriorityToFrontend[t.priority] ?? 'medium',
    dueDate: t.due_at,
    tags: [],
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }
}

interface AppStore {
  // State
  user: User | null
  notes: Note[]
  tasks: Task[]
  projects: Project[]
  files: FileItem[]
  isOverlayOpen: boolean
  sidebarCollapsed: boolean
  isLoading: boolean
  loading: { projects: boolean; notes: boolean; tasks: boolean; files: boolean }
  errors: { projects: string | null; notes: string | null; tasks: string | null; files: string | null }

  // Auth actions (async — throw ApiError on failure)
  loadUser: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void

  // Data loading
  loadProjects: () => Promise<void>
  loadNotes: () => Promise<void>
  loadTasks: () => Promise<void>
  loadFiles: () => Promise<void>

  // Overlay actions
  toggleOverlay: () => void
  setOverlayOpen: (open: boolean) => void

  // Sidebar actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Notes CRUD
  createNote: (note: CreateNote) => Promise<Note>
  updateNote: (id: string, updates: UpdateNote) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  getNoteById: (id: string) => Note | undefined
  getNotesByProject: (projectId: string | null) => Note[]

  // Tasks CRUD
  createTask: (task: CreateTask) => Promise<Task>
  updateTask: (id: string, updates: UpdateTask) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  getTaskById: (id: string) => Task | undefined
  getTasksByProject: (projectId: string | null) => Task[]
  getTasksByStatus: (status: Task['status']) => Task[]

  // Projects CRUD
  createProject: (project: CreateProject) => Promise<Project>
  updateProject: (id: string, updates: UpdateProject) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  getProjectById: (id: string) => Project | undefined

  // Files CRUD
  createFile: (file: File, projectId: string) => Promise<FileItem>
  deleteFile: (id: string) => Promise<void>
  getFileById: (id: string) => FileItem | undefined
  getFilesByProject: (projectId: string | null) => FileItem[]
}

export const useAppStore = create<AppStore>()((set, get) => ({
  user: null,
  notes: [],
  tasks: [],
  projects: [],
  files: [],
  isOverlayOpen: false,
  sidebarCollapsed: false,
  isLoading: false,
  loading: { projects: false, notes: false, tasks: false, files: false },
  errors: { projects: null, notes: null, tasks: null, files: null },

  // --- Auth ---

  loadUser: async () => {
    try {
      const res = await authApi.me()
      const user: User = {
        id: res.id,
        email: res.email,
        name: res.display_name,
        avatar: null,
        plan: (res.plan as 'free' | 'pro' | 'team') || 'free',
        createdAt: res.created_at,
      }
      set({ user })
    } catch {
      set({ user: null })
    }
  },

  login: async (email, password) => {
    const res = await authApi.login(email, password)
    const user: User = {
      id: res.user.id,
      email: res.user.email,
      name: res.user.display_name,
      avatar: null,
      plan: (res.user.plan as 'free' | 'pro' | 'team') || 'free',
      createdAt: res.user.created_at,
    }
    set({ user })
  },

  register: async (email, password, name) => {
    const res = await authApi.register(email, password, name)
    const user: User = {
      id: res.user.id,
      email: res.user.email,
      name: res.user.display_name,
      avatar: null,
      plan: (res.user.plan as 'free' | 'pro' | 'team') || 'free',
      createdAt: res.user.created_at,
    }
    set({ user })
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {}
    set({ user: null, notes: [], tasks: [], projects: [], files: [] })
  },

  updateUser: (updates) => {
    set((s) => ({ user: s.user ? { ...s.user, ...updates } : null }))
  },

  // --- Data loading ---

  loadProjects: async () => {
    set((s) => ({
      isLoading: true,
      loading: { ...s.loading, projects: true },
      errors: { ...s.errors, projects: null },
    }))
    try {
      const res = await projectsApi.list({ limit: 100 })
      set((s) => ({
        projects: res.items.map(mapProject),
        errors: { ...s.errors, projects: null },
      }))
    } catch (err) {
      set((s) => ({
        errors: {
          ...s.errors,
          projects: err instanceof Error ? err.message : 'Не удалось загрузить проекты',
        },
      }))
    } finally {
      set((s) => {
        const loading = { ...s.loading, projects: false }
        return { loading, isLoading: Object.values(loading).some(Boolean) }
      })
    }
  },

  loadNotes: async () => {
    set((s) => ({
      isLoading: true,
      loading: { ...s.loading, notes: true },
      errors: { ...s.errors, notes: null },
    }))
    try {
      const res = await notesApi.list({ limit: 100 })
      set((s) => ({
        notes: res.items.map(mapNote),
        errors: { ...s.errors, notes: null },
      }))
    } catch (err) {
      set((s) => ({
        errors: {
          ...s.errors,
          notes: err instanceof Error ? err.message : 'Не удалось загрузить заметки',
        },
      }))
    } finally {
      set((s) => {
        const loading = { ...s.loading, notes: false }
        return { loading, isLoading: Object.values(loading).some(Boolean) }
      })
    }
  },

  loadTasks: async () => {
    set((s) => ({
      isLoading: true,
      loading: { ...s.loading, tasks: true },
      errors: { ...s.errors, tasks: null },
    }))
    try {
      const res = await tasksApi.list({ limit: 100 })
      set((s) => ({ tasks: res.items.map(mapTask), errors: { ...s.errors, tasks: null } }))
    } catch (err) {
      set((s) => ({
        errors: {
          ...s.errors,
          tasks: err instanceof Error ? err.message : 'Не удалось загрузить задачи',
        },
      }))
    } finally {
      set((s) => {
        const loading = { ...s.loading, tasks: false }
        return { loading, isLoading: Object.values(loading).some(Boolean) }
      })
    }
  },

  loadFiles: async () => {
    set((s) => ({
      isLoading: true,
      loading: { ...s.loading, files: true },
      errors: { ...s.errors, files: null },
    }))
    try {
      const projects = get().projects
      const allFiles: FileItem[] = []
      for (const project of projects) {
        const res = await projectsApi.getFiles(project.id)
        for (const f of res.items) {
          allFiles.push({
            id: f.id,
            name: f.original_name,
            type: f.mime_type,
            size: f.size_bytes,
            url: filesApi.downloadUrl(f.id),
            projectId: project.id,
            tags: [],
            createdAt: f.created_at,
            updatedAt: f.updated_at,
          })
        }
      }
      set((s) => ({ files: allFiles, errors: { ...s.errors, files: null } }))
    } catch (err) {
      set((s) => ({
        errors: {
          ...s.errors,
          files: err instanceof Error ? err.message : 'Не удалось загрузить файлы',
        },
      }))
    } finally {
      set((s) => {
        const loading = { ...s.loading, files: false }
        return { loading, isLoading: Object.values(loading).some(Boolean) }
      })
    }
  },

  // --- Overlay ---
  toggleOverlay: () => set((s) => ({ isOverlayOpen: !s.isOverlayOpen })),
  setOverlayOpen: (open) => set({ isOverlayOpen: open }),

  // --- Sidebar ---
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // --- Notes ---

  createNote: async (noteData) => {
    const projectId = noteData.projectId
    if (!projectId) throw new Error('Заметка должна принадлежать проекту')
    const created = await notesApi.create({
      project_id: projectId,
      title: noteData.title,
      content: noteData.content,
      status: 'draft',
      is_pinned: noteData.isPinned ?? false,
    })
    const note = mapNote(created)
    set((s) => ({ notes: [note, ...s.notes] }))
    return note
  },

  updateNote: async (id, updates) => {
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: now() } : n)),
    }))
    try {
      const body: Record<string, unknown> = {}
      if (updates.title !== undefined) body.title = updates.title
      if (updates.content !== undefined) body.content = updates.content
      if (updates.isPinned !== undefined) body.is_pinned = updates.isPinned
      await notesApi.update(id, body)
    } catch {}
  },

  deleteNote: async (id) => {
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }))
    try {
      await notesApi.delete(id)
    } catch {}
  },

  getNoteById: (id) => get().notes.find((n) => n.id === id),
  getNotesByProject: (projectId) => get().notes.filter((n) => n.projectId === projectId),

  // --- Tasks ---

  createTask: async (taskData) => {
    const projectId = taskData.projectId
    if (!projectId) throw new Error('Задача должна принадлежать проекту')
    const created = await tasksApi.create({
      project_id: projectId,
      title: taskData.title,
      description: taskData.description,
      status: frontendStatusToBackend[taskData.status] ?? 'todo',
      priority: frontendPriorityToBackend[taskData.priority] ?? 'medium',
      due_at: taskData.dueDate,
    })
    const task = mapTask(created)
    set((s) => ({ tasks: [task, ...s.tasks] }))
    return task
  },

  updateTask: async (id, updates) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now() } : t)),
    }))
    try {
      const backendUpdates: Record<string, unknown> = {}
      if (updates.title !== undefined) backendUpdates.title = updates.title
      if (updates.description !== undefined) backendUpdates.description = updates.description
      if (updates.status !== undefined) backendUpdates.status = frontendStatusToBackend[updates.status]
      if (updates.priority !== undefined) backendUpdates.priority = frontendPriorityToBackend[updates.priority]
      if (updates.dueDate !== undefined) backendUpdates.due_at = updates.dueDate
      await tasksApi.update(id, backendUpdates)
    } catch {}
  },

  deleteTask: async (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
    try {
      await tasksApi.delete(id)
    } catch {}
  },

  getTaskById: (id) => get().tasks.find((t) => t.id === id),
  getTasksByProject: (projectId) => get().tasks.filter((t) => t.projectId === projectId),
  getTasksByStatus: (status) => get().tasks.filter((t) => t.status === status),

  // --- Projects ---

  createProject: async (projectData) => {
    const created = await projectsApi.create({
      kind: 'project',
      title: projectData.name,
      description: projectData.description,
      color: projectData.color,
      status: 'active',
    })
    const project = mapProject(created)
    set((s) => ({ projects: [project, ...s.projects] }))
    return project
  },

  updateProject: async (id, updates) => {
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: now() } : p)),
    }))
    try {
      const body: Record<string, unknown> = {}
      if (updates.name !== undefined) body.title = updates.name
      if (updates.description !== undefined) body.description = updates.description
      if (updates.color !== undefined) body.color = updates.color
      if (Object.keys(body).length > 0) {
        await projectsApi.update(id, body)
      }
    } catch {}
  },

  deleteProject: async (id) => {
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      notes: s.notes.map((n) => (n.projectId === id ? { ...n, projectId: null } : n)),
      tasks: s.tasks.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)),
      files: s.files.map((f) => (f.projectId === id ? { ...f, projectId: null } : f)),
    }))
    try {
      await projectsApi.delete(id)
    } catch {}
  },

  getProjectById: (id) => get().projects.find((p) => p.id === id),

  // --- Files ---

  createFile: async (file, projectId) => {
    const uploaded = await filesApi.upload(file, projectId)
    const fileItem: FileItem = {
      id: uploaded.id,
      name: uploaded.original_name,
      type: uploaded.mime_type,
      size: uploaded.size_bytes,
      url: filesApi.downloadUrl(uploaded.id),
      projectId,
      tags: [],
      createdAt: uploaded.created_at,
      updatedAt: uploaded.updated_at,
    }
    set((s) => ({ files: [fileItem, ...s.files] }))
    return fileItem
  },

  deleteFile: async (id) => {
    set((s) => ({ files: s.files.filter((f) => f.id !== id) }))
    try {
      await filesApi.delete(id)
    } catch {}
  },

  getFileById: (id) => get().files.find((f) => f.id === id),
  getFilesByProject: (projectId) => get().files.filter((f) => f.projectId === projectId),
}))