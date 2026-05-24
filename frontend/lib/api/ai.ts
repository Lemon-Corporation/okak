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
    api.post<ChatResponse>('/ai/ask', { messages }),
  
  tts: async (text: string) => {
    // Determine base URL since we need native fetch to get Blob
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1'

    const res = await fetch(`${BASE_URL}/ai/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text }),
    })
    
    if (!res.ok) throw new Error(`TTS Failed: ${res.status}`)
    const blob = await res.blob()
    return URL.createObjectURL(blob)
  }
}
