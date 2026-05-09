import { api } from './client'
import type { SearchResponse } from './dto'

export const searchApi = {
  search: (q: string, kind?: 'note' | 'task' | 'project', limit = 10) => {
    const params = new URLSearchParams({ q, limit: String(limit) })
    if (kind) params.set('kind', kind)
    return api.get<SearchResponse>(`/search?${params}`)
  },
}
