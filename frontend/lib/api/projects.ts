import { api } from './client'
import type { BackendProject, PaginatedResponse } from './dto'

export interface ProjectsQuery {
  kind?: string
  status?: string
  archived?: boolean
  limit?: number
  offset?: number
}

export interface CreateProjectBody {
  kind?: string
  title: string
  description?: string
  color?: string
  parent_project_id?: string | null
  status?: string
}

export interface UpdateProjectBody {
  title?: string
  description?: string
  color?: string
  status?: string
  kind?: string
  parent_project_id?: string | null
}

function qs(params: Record<string, unknown>): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) p.set(k, String(v))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

export const projectsApi = {
  list: (query: ProjectsQuery = {}) =>
    api.get<PaginatedResponse<BackendProject>>(`/projects${qs(query as Record<string, unknown>)}`),

  get: (id: string) =>
    api.get<BackendProject>(`/projects/${id}`),

  create: (body: CreateProjectBody) =>
    api.post<BackendProject>('/projects', body),

  update: (id: string, body: UpdateProjectBody) =>
    api.patch<BackendProject>(`/projects/${id}`, body),

  delete: (id: string) =>
    api.delete(`/projects/${id}`),

  getFiles: (id: string, query: { limit?: number; offset?: number } = {}) => {
    const params = new URLSearchParams()
    if (query.limit) params.set('limit', String(query.limit))
    if (query.offset) params.set('offset', String(query.offset))
    const qs = params.toString()
    return api.get<PaginatedResponse<import('./dto').BackendFile>>(`/projects/${id}/files${qs ? `?${qs}` : ''}`)
  },

  getNotes: (id: string, query: { limit?: number; offset?: number } = {}) => {
    const params = new URLSearchParams()
    if (query.limit) params.set('limit', String(query.limit))
    if (query.offset) params.set('offset', String(query.offset))
    const qs = params.toString()
    return api.get<PaginatedResponse<import('./dto').BackendNote>>(`/projects/${id}/notes${qs ? `?${qs}` : ''}`)
  },

  getTasks: (id: string, query: { limit?: number; offset?: number } = {}) => {
    const params = new URLSearchParams()
    if (query.limit) params.set('limit', String(query.limit))
    if (query.offset) params.set('offset', String(query.offset))
    const qs = params.toString()
    return api.get<PaginatedResponse<import('./dto').BackendTask>>(`/projects/${id}/tasks${qs ? `?${qs}` : ''}`)
  },

  attachFile: (projectId: string, fileId: string) =>
    api.post(`/projects/${projectId}/files`, { file_id: fileId }),

  detachFile: (projectId: string, fileId: string) =>
    api.delete(`/projects/${projectId}/files/${fileId}`),
}
