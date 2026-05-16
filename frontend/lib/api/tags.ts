import { api } from './client'

export interface BackendTag {
  id: string
  name: string
  color: string
  created_at: string
}

export interface TagsListResponse {
  items: BackendTag[]
}

export interface TagCreateBody {
  name: string
  color: string
}

export interface TagUpdateBody {
  name?: string
  color?: string
}

export const tagsApi = {
  list: () =>
    api.get<TagsListResponse>('/tags'),

  create: (body: TagCreateBody) =>
    api.post<BackendTag>('/tags', body),

  update: (id: string, body: TagUpdateBody) =>
    api.patch<BackendTag>(`/tags/${id}`, body),

  delete: (id: string) =>
    api.delete(`/tags/${id}`),
}
