import { api } from './client'
import type { BackendTask, PaginatedResponse } from './dto'

export interface TasksQuery {
  project_id?: string
  status?: string
  priority?: string
  linked_note_id?: string
  due_before?: string
  due_after?: string
  archived?: boolean
  limit?: number
  offset?: number
}

export interface CreateTaskBody {
  project_id: string
  title: string
  description?: string
  status?: string
  priority?: string
  due_at?: string | null
  linked_note_id?: string | null
}

export interface UpdateTaskBody {
  title?: string
  description?: string
  status?: string
  priority?: string
  due_at?: string | null
  linked_note_id?: string | null
}

function qs(params: Record<string, unknown>): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) p.set(k, String(v))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

export const tasksApi = {
  list: (query: TasksQuery = {}) =>
    api.get<PaginatedResponse<BackendTask>>(`/tasks${qs(query as Record<string, unknown>)}`),

  get: (id: string) =>
    api.get<BackendTask>(`/tasks/${id}`),

  create: (body: CreateTaskBody) =>
    api.post<BackendTask>('/tasks', body),

  update: (id: string, body: UpdateTaskBody) =>
    api.patch<BackendTask>(`/tasks/${id}`, body),

  delete: (id: string) =>
    api.delete(`/tasks/${id}`),

  attachFile: (taskId: string, fileId: string) =>
    api.post(`/tasks/${taskId}/files`, { file_id: fileId }),

  detachFile: (taskId: string, fileId: string) =>
    api.delete(`/tasks/${taskId}/files/${fileId}`),
}
