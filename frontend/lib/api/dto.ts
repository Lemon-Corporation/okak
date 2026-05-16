// Raw types from the backend API — not for UI use directly

export interface BackendUser {
  id: string
  email: string
  display_name: string
  plan: string
  created_at: string
  updated_at?: string
}

export interface AuthResponse {
  access_token: string
  token_type: 'bearer'
  user: BackendUser
}

export interface BackendProject {
  id: string
  owner_user_id: string
  parent_project_id: string | null
  kind: string
  title: string
  description: string
  color: string
  status: string
  created_at: string
  updated_at: string
  archived_at: string | null
}

export interface BackendTag {
  id: string
  name: string
  color: string
}

export interface BackendFileRef {
  id: string
  original_name: string
  mime_type: string
  size_bytes: number
  created_at: string
}

export interface BackendNote {
  id: string
  project_id: string
  title: string
  content: string
  status: string
  created_at: string
  updated_at: string
  archived_at: string | null
  is_pinned: boolean
  tags: BackendTag[]
  files?: BackendFileRef[]
}

export interface BackendTask {
  id: string
  project_id: string
  linked_note_id: string | null
  title: string
  description: string
  status: string
  priority: string
  due_at: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  archived_at: string | null
  files?: BackendFileRef[]
}

export interface BackendFile {
  id: string
  original_name: string
  storage_key: string
  mime_type: string
  extension: string
  size_bytes: number
  checksum_sha256: string
  source: string
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface SearchNote {
  id: string
  project_id: string
  title: string
  content_excerpt: string
  status: string
  is_pinned: boolean
  updated_at: string
}

export interface SearchTask {
  id: string
  project_id: string
  title: string
  status: string
  priority: string
  updated_at: string
}

export interface SearchProject {
  id: string
  kind: string
  title: string
  status: string
  color: string
  updated_at: string
}

export interface SearchResponse {
  notes: SearchNote[]
  tasks: SearchTask[]
  projects: SearchProject[]
}
