import { api } from './client'
import type { BackendFile } from './dto'

export const filesApi = {
  upload: (file: File, projectId: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('project_id', projectId)
    return api.post<BackendFile>('/files/upload', form)
  },

  get: (id: string) =>
    api.get<BackendFile>(`/files/${id}`),

  downloadUrl: (id: string): string => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1'
    return `${base}/files/${id}/download`
  },

  delete: (id: string) =>
    api.delete(`/files/${id}`),
}
