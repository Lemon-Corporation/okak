import { api } from './client'
import type { AuthResponse, BackendUser } from './dto'

export const authApi = {
  register: (email: string, password: string, display_name: string) =>
    api.post<AuthResponse>('/auth/register', { email, password, display_name }, { skipAuth: true }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }, { skipAuth: true }),

  logout: () =>
    api.post<void>('/auth/logout'),

  me: () =>
    api.get<BackendUser>('/auth/me'),

  updateMe: (data: { display_name?: string; password?: string }) =>
    api.patch<BackendUser>('/auth/me', data),
}
