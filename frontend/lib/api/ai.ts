import { api } from './client'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  role: string
  content: string
  actions?: Array<{
    type: string
    payload: any
  }>
}

export const aiApi = {
  chat: (messages: ChatMessage[]) =>
    api.post<ChatResponse>('/ai/chat', { messages }),
  
  tts: async (text: string) => {
    // Determine base URL since we need native fetch to get Blob
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1'

    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('okak_access_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const res = await fetch(`${BASE_URL}/ai/tts`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ text }),
    })
    
    if (!res.ok) throw new Error(`TTS Failed: ${res.status}`)
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  }
}
