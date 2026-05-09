'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Note,
  Task,
  Project,
  FileItem,
  User,
  CreateNote,
  CreateTask,
  CreateProject,
  CreateFileItem,
  UpdateNote,
  UpdateTask,
  UpdateProject,
  UpdateFileItem,
} from './types'
import { generateId, now } from './utils'
import { session } from './session'
import { authApi, projectsApi, notesApi, tasksApi } from './api'
import type { BackendProject, BackendNote, BackendTask } from './api/dto'
import { PROJECT_COLORS } from './utils'

// --- mappers ---

function mapProject(p: BackendProject, color?: string): Project {
  return {
    id: p.id,
    name: p.title,
    description: p.description ?? '',
    color: color ?? PROJECT_COLORS[0],
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
    isPinned: false,
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

  // Auth actions (async — throw ApiError on failure)
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void

  // Data loading
  loadProjects: () => Promise<void>
  loadNotes: () => Promise<void>
  loadTasks: () => Promise<void>

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

  // Files CRUD (local only — upload handled via filesApi directly)
  createFile: (file: CreateFileItem) => FileItem
  updateFile: (id: string, updates: UpdateFileItem) => void
  deleteFile: (id: string) => void
  getFileById: (id: string) => FileItem | undefined
  getFilesByProject: (projectId: string | null) => FileItem[]

  // Search (local)
  search: (query: string) => {
    notes: Note[]
    tasks: Task[]
    projects: Project[]
    files: FileItem[]
  }
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      notes: [],
      tasks: [],
      projects: [],
      files: [],
      isOverlayOpen: false,
      sidebarCollapsed: false,
      isLoading: false,

      // --- Auth ---

      login: async (email, password) => {
        if (email === 'demo@example.com' && password === 'demo123') {
          session.set('demo-token')
          set({
            user: {
              id: 'demo',
              email: 'demo@example.com',
              name: 'Demo User',
              avatar: null,
              plan: 'free',
              createdAt: new Date().toISOString(),
            },
          })
          return
        }
        const res = await authApi.login(email, password)
        session.set(res.access_token)
        const user: User = {
          id: res.user.id,
          email: res.user.email,
          name: res.user.display_name,
          avatar: null,
          plan: 'free',
          createdAt: res.user.created_at,
        }
        set({ user })
      },

      register: async (email, password, name) => {
        const res = await authApi.register(email, password, name)
        session.set(res.access_token)
        const user: User = {
          id: res.user.id,
          email: res.user.email,
          name: res.user.display_name,
          avatar: null,
          plan: 'free',
          createdAt: res.user.created_at,
        }
        set({ user })
      },

      logout: () => {
        session.clear()
        set({ user: null, notes: [], tasks: [], projects: [], files: [] })
      },

      // --- Data loading ---

      loadProjects: async () => {
        try {
          const res = await projectsApi.list({ limit: 100 })
          const existing = get().projects
          const colorMap = Object.fromEntries(existing.map((p) => [p.id, p.color]))
          set({
            projects: res.items.map((p) =>
              mapProject(p, colorMap[p.id] ?? PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)])
            ),
          })
        } catch {}
      },

      loadNotes: async () => {
        try {
          const res = await notesApi.list({ limit: 100 })
          const existing = get().notes
          const pinnedMap = Object.fromEntries(existing.map((n) => [n.id, n.isPinned]))
          set({
            notes: res.items.map((n) => ({ ...mapNote(n), isPinned: pinnedMap[n.id] ?? false })),
          })
        } catch {}
      },

      loadTasks: async () => {
        try {
          const res = await tasksApi.list({ limit: 100 })
          set({ tasks: res.items.map(mapTask) })
        } catch {}
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
        if (projectId) {
          try {
            const created = await notesApi.create({
              project_id: projectId,
              title: noteData.title,
              content: noteData.content,
              status: 'draft',
            })
            const note = { ...mapNote(created), isPinned: noteData.isPinned }
            set((s) => ({ notes: [note, ...s.notes] }))
            return note
          } catch {}
        }
        // Fallback: local-only note (no project or API down)
        const note: Note = { ...noteData, id: generateId(), createdAt: now(), updatedAt: now() }
        set((s) => ({ notes: [note, ...s.notes] }))
        return note
      },

      updateNote: async (id, updates) => {
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: now() } : n)),
        }))
        try {
          await notesApi.update(id, {
            title: updates.title,
            content: updates.content,
          })
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
        if (projectId) {
          try {
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
          } catch {}
        }
        const task: Task = { ...taskData, id: generateId(), createdAt: now(), updatedAt: now() }
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
        try {
          const created = await projectsApi.create({
            kind: 'project',
            title: projectData.name,
            description: projectData.description,
            status: 'active',
          })
          const project = mapProject(created, projectData.color)
          set((s) => ({ projects: [project, ...s.projects] }))
          return project
        } catch {
          const project: Project = { ...projectData, id: generateId(), createdAt: now(), updatedAt: now() }
          set((s) => ({ projects: [project, ...s.projects] }))
          return project
        }
      },

      updateProject: async (id, updates) => {
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: now() } : p)),
        }))
        try {
          if (updates.name || updates.description) {
            await projectsApi.update(id, {
              title: updates.name,
              description: updates.description,
            })
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

      // --- Files (local only; use filesApi for actual upload) ---

      createFile: (fileData) => {
        const file: FileItem = { ...fileData, id: generateId(), createdAt: now(), updatedAt: now() }
        set((s) => ({ files: [file, ...s.files] }))
        return file
      },

      updateFile: (id, updates) => {
        set((s) => ({
          files: s.files.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: now() } : f)),
        }))
      },

      deleteFile: (id) => {
        set((s) => ({ files: s.files.filter((f) => f.id !== id) }))
      },

      getFileById: (id) => get().files.find((f) => f.id === id),
      getFilesByProject: (projectId) => get().files.filter((f) => f.projectId === projectId),

      // --- Search (local) ---

      search: (query) => {
        const q = query.toLowerCase()
        const s = get()
        return {
          notes: s.notes.filter(
            (n) =>
              n.title.toLowerCase().includes(q) ||
              n.content.toLowerCase().includes(q) ||
              n.tags.some((t) => t.toLowerCase().includes(q))
          ),
          tasks: s.tasks.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.description.toLowerCase().includes(q) ||
              t.tags.some((tag) => tag.toLowerCase().includes(q))
          ),
          projects: s.projects.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q)
          ),
          files: s.files.filter(
            (f) =>
              f.name.toLowerCase().includes(q) ||
              f.tags.some((t) => t.toLowerCase().includes(q))
          ),
        }
      },
    }),
    {
      name: 'app-storage',
      partialize: (s) => ({
        user: s.user,
        notes: s.notes,
        tasks: s.tasks,
        projects: s.projects,
        files: s.files,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
    }
  )
)
