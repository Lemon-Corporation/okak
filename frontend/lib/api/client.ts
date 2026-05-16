import { session } from '../session'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, headers: rawHeaders, ...init } = options
  const headers = new Headers(rawHeaders as HeadersInit)

  if (!skipAuth) {
    const token = session.get()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    let code = 'unknown_error'
    let detail = `HTTP ${res.status}`
    try {
      const body = await res.json()
      code = body.code ?? code
      detail = body.detail ?? detail
    } catch {}
    throw new ApiError(res.status, code, detail)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

type Init = RequestInit & { skipAuth?: boolean }

export const api = {
  get: <T>(path: string, init?: Init) =>
    request<T>(path, { ...init, method: 'GET' }),

  post: <T>(path: string, body?: unknown, init?: Init) =>
    request<T>(path, {
      ...init,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(path: string, body: unknown, init?: Init) =>
    request<T>(path, { ...init, method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T = void>(path: string, init?: Init) =>
    request<T>(path, { ...init, method: 'DELETE' }),
}
