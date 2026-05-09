import { api } from './client'
import type { BackendNote, PaginatedResponse } from './dto'

export interface NotesQuery {
  project_id?: string
  status?: string
  tag_id?: string
  archived?: boolean
  q?: string
  limit?: number
  offset?: number
}

export interface CreateNoteBody {
  project_id: string
  title: string
  content?: string
  status?: string
}

export interface UpdateNoteBody {
  title?: string
  content?: string
  status?: string
}

function qs(params: Record<string, unknown>): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) p.set(k, String(v))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

export const notesApi = {
  list: (query: NotesQuery = {}) =>
    api.get<PaginatedResponse<BackendNote>>(`/notes${qs(query as Record<string, unknown>)}`),

  get: (id: string) =>
    api.get<BackendNote>(`/notes/${id}`),

  create: (body: CreateNoteBody) =>
    api.post<BackendNote>('/notes', body),

  update: (id: string, body: UpdateNoteBody) =>
    api.patch<BackendNote>(`/notes/${id}`, body),

  delete: (id: string) =>
    api.delete(`/notes/${id}`),

  addTag: (noteId: string, tagId: string) =>
    api.post(`/notes/${noteId}/tags`, { tag_id: tagId }),

  removeTag: (noteId: string, tagId: string) =>
    api.delete(`/notes/${noteId}/tags/${tagId}`),

  attachFile: (noteId: string, fileId: string) =>
    api.post(`/notes/${noteId}/files`, { file_id: fileId }),

  detachFile: (noteId: string, fileId: string) =>
    api.delete(`/notes/${noteId}/files/${fileId}`),
}
