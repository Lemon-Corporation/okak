import { api } from './client'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  role: string
  content: string
}

export const aiApi = {
  chat: (messages: ChatMessage[]) =>
    api.post<ChatResponse>('/ai/chat', { messages }),
}
