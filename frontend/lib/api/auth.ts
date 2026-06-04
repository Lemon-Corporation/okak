import { api } from './client'
import type { AuthResponse, BackendUser, MessageResponse, RegisterInitResponse } from './dto'

export const authApi = {
  register: (email: string, password: string, display_name: string) =>
    api.post<RegisterInitResponse>('/auth/register', { email, password, display_name }, { skipAuth: true }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }, { skipAuth: true }),

  verifyEmail: (email: string, code: string) =>
    api.post<AuthResponse>('/auth/verify-email', { email, code }, { skipAuth: true }),

  resendVerification: (email: string) =>
    api.post<MessageResponse>('/auth/resend-verification', { email }, { skipAuth: true }),

  forgotPassword: (email: string) =>
    api.post<MessageResponse>('/auth/forgot-password', { email }, { skipAuth: true }),

  resetPassword: (email: string, code: string, new_password: string) =>
    api.post<MessageResponse>('/auth/reset-password', { email, code, new_password }, { skipAuth: true }),

  logout: () =>
    api.post<void>('/auth/logout'),

  me: () =>
    api.get<BackendUser>('/auth/me'),

  updateMe: (data: { display_name?: string; password?: string }) =>
    api.patch<BackendUser>('/auth/me', data),
}
