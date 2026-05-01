// Core entity types for the app

export type EntityType = 'note' | 'task' | 'project' | 'file'

export interface Note {
  id: string
  title: string
  content: string
  projectId: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
  isPinned: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  projectId: string | null
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  color: string
  icon: string
  createdAt: string
  updatedAt: string
}

export interface FileItem {
  id: string
  name: string
  type: string
  size: number
  url: string
  projectId: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar: string | null
  plan: 'free' | 'pro' | 'team'
  createdAt: string
}

export interface AppState {
  user: User | null
  notes: Note[]
  tasks: Task[]
  projects: Project[]
  files: FileItem[]
  isOverlayOpen: boolean
  sidebarCollapsed: boolean
}

// Utility types
export type CreateNote = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
export type CreateTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
export type CreateProject = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
export type CreateFileItem = Omit<FileItem, 'id' | 'createdAt' | 'updatedAt'>

export type UpdateNote = Partial<Omit<Note, 'id' | 'createdAt'>>
export type UpdateTask = Partial<Omit<Task, 'id' | 'createdAt'>>
export type UpdateProject = Partial<Omit<Project, 'id' | 'createdAt'>>
export type UpdateFileItem = Partial<Omit<FileItem, 'id' | 'createdAt'>>
