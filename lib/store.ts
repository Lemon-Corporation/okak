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

interface AppStore {
  // State
  user: User | null
  notes: Note[]
  tasks: Task[]
  projects: Project[]
  files: FileItem[]
  isOverlayOpen: boolean
  sidebarCollapsed: boolean

  // Auth actions
  login: (email: string, password: string) => boolean
  register: (email: string, password: string, name: string) => boolean
  logout: () => void

  // Overlay actions
  toggleOverlay: () => void
  setOverlayOpen: (open: boolean) => void

  // Sidebar actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Notes CRUD
  createNote: (note: CreateNote) => Note
  updateNote: (id: string, updates: UpdateNote) => void
  deleteNote: (id: string) => void
  getNoteById: (id: string) => Note | undefined
  getNotesByProject: (projectId: string | null) => Note[]

  // Tasks CRUD
  createTask: (task: CreateTask) => Task
  updateTask: (id: string, updates: UpdateTask) => void
  deleteTask: (id: string) => void
  getTaskById: (id: string) => Task | undefined
  getTasksByProject: (projectId: string | null) => Task[]
  getTasksByStatus: (status: Task['status']) => Task[]

  // Projects CRUD
  createProject: (project: CreateProject) => Project
  updateProject: (id: string, updates: UpdateProject) => void
  deleteProject: (id: string) => void
  getProjectById: (id: string) => Project | undefined

  // Files CRUD
  createFile: (file: CreateFileItem) => FileItem
  updateFile: (id: string, updates: UpdateFileItem) => void
  deleteFile: (id: string) => void
  getFileById: (id: string) => FileItem | undefined
  getFilesByProject: (projectId: string | null) => FileItem[]

  // Search
  search: (query: string) => {
    notes: Note[]
    tasks: Task[]
    projects: Project[]
    files: FileItem[]
  }
}

// Mock users database
const mockUsers: Map<string, { password: string; user: User }> = new Map()

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      notes: [],
      tasks: [],
      projects: [],
      files: [],
      isOverlayOpen: false,
      sidebarCollapsed: false,

      // Auth
      login: (email: string, password: string) => {
        const stored = mockUsers.get(email)
        if (stored && stored.password === password) {
          set({ user: stored.user })
          return true
        }
        // Demo account
        if (email === 'demo@example.com' && password === 'demo123') {
          const user: User = {
            id: generateId(),
            email,
            name: 'Demo User',
            avatar: null,
            plan: 'pro',
            createdAt: now(),
          }
          set({ user })
          return true
        }
        return false
      },

      register: (email: string, password: string, name: string) => {
        if (mockUsers.has(email)) {
          return false
        }
        const user: User = {
          id: generateId(),
          email,
          name,
          avatar: null,
          plan: 'free',
          createdAt: now(),
        }
        mockUsers.set(email, { password, user })
        set({ user })
        return true
      },

      logout: () => {
        set({ user: null })
      },

      // Overlay
      toggleOverlay: () => set((state) => ({ isOverlayOpen: !state.isOverlayOpen })),
      setOverlayOpen: (open) => set({ isOverlayOpen: open }),

      // Sidebar
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Notes
      createNote: (noteData) => {
        const note: Note = {
          ...noteData,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        }
        set((state) => ({ notes: [note, ...state.notes] }))
        return note
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, ...updates, updatedAt: now() } : note
          ),
        }))
      },

      deleteNote: (id) => {
        set((state) => ({ notes: state.notes.filter((note) => note.id !== id) }))
      },

      getNoteById: (id) => get().notes.find((note) => note.id === id),

      getNotesByProject: (projectId) =>
        get().notes.filter((note) => note.projectId === projectId),

      // Tasks
      createTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        }
        set((state) => ({ tasks: [task, ...state.tasks] }))
        return task
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: now() } : task
          ),
        }))
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }))
      },

      getTaskById: (id) => get().tasks.find((task) => task.id === id),

      getTasksByProject: (projectId) =>
        get().tasks.filter((task) => task.projectId === projectId),

      getTasksByStatus: (status) =>
        get().tasks.filter((task) => task.status === status),

      // Projects
      createProject: (projectData) => {
        const project: Project = {
          ...projectData,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        }
        set((state) => ({ projects: [project, ...state.projects] }))
        return project
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates, updatedAt: now() } : project
          ),
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          // Also remove project association from related items
          notes: state.notes.map((note) =>
            note.projectId === id ? { ...note, projectId: null } : note
          ),
          tasks: state.tasks.map((task) =>
            task.projectId === id ? { ...task, projectId: null } : task
          ),
          files: state.files.map((file) =>
            file.projectId === id ? { ...file, projectId: null } : file
          ),
        }))
      },

      getProjectById: (id) => get().projects.find((project) => project.id === id),

      // Files
      createFile: (fileData) => {
        const file: FileItem = {
          ...fileData,
          id: generateId(),
          createdAt: now(),
          updatedAt: now(),
        }
        set((state) => ({ files: [file, ...state.files] }))
        return file
      },

      updateFile: (id, updates) => {
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id ? { ...file, ...updates, updatedAt: now() } : file
          ),
        }))
      },

      deleteFile: (id) => {
        set((state) => ({ files: state.files.filter((file) => file.id !== id) }))
      },

      getFileById: (id) => get().files.find((file) => file.id === id),

      getFilesByProject: (projectId) =>
        get().files.filter((file) => file.projectId === projectId),

      // Search
      search: (query) => {
        const q = query.toLowerCase()
        const state = get()

        return {
          notes: state.notes.filter(
            (note) =>
              note.title.toLowerCase().includes(q) ||
              note.content.toLowerCase().includes(q) ||
              note.tags.some((tag) => tag.toLowerCase().includes(q))
          ),
          tasks: state.tasks.filter(
            (task) =>
              task.title.toLowerCase().includes(q) ||
              task.description.toLowerCase().includes(q) ||
              task.tags.some((tag) => tag.toLowerCase().includes(q))
          ),
          projects: state.projects.filter(
            (project) =>
              project.name.toLowerCase().includes(q) ||
              project.description.toLowerCase().includes(q)
          ),
          files: state.files.filter(
            (file) =>
              file.name.toLowerCase().includes(q) ||
              file.tags.some((tag) => tag.toLowerCase().includes(q))
          ),
        }
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        user: state.user,
        notes: state.notes,
        tasks: state.tasks,
        projects: state.projects,
        files: state.files,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
