'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/brand-mark'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { ApiError } from '@/lib/api'
import { getStoredClientMode } from '@/lib/client-mode'
import { isElectron } from '@/lib/electron'
import { Loader2 } from 'lucide-react'

const errorMessages: Record<string, string> = {
  invalid_credentials: 'Неверный email или пароль',
  email_not_verified: 'Подтвердите почту кодом из письма, чтобы войти',
  token_expired: 'Сессия истекла, войдите снова',
  token_invalid: 'Ошибка авторизации, попробуйте снова',
}

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAppStore((state) => state.login)
  const isDesktopApp = isElectron()
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const resetComplete = searchParams.get('reset') === 'success'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      setError('Введите email')
      return
    }
    if (!password) {
      setError('Введите пароль')
      return
    }

    setIsLoading(true)
    try {
      setUnverifiedEmail('')
      await login(normalizedEmail, password)
      if (isDesktopApp) {
        router.push('/space')
      } else if (getStoredClientMode() === 'browser') {
        router.push('/space')
      } else {
        router.push('/getting-started')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'email_not_verified') {
          setUnverifiedEmail(normalizedEmail)
        }
        setError(errorMessages[err.code] ?? err.message)
      } else {
        setError('Не удалось подключиться к серверу')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <BrandMark className="mb-4" />
          <h1 className="text-2xl font-semibold text-foreground">Войти в аккаунт</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Введите данные для входа
          </p>
        </div>

        {resetComplete && (
          <div className="mb-4 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
            Пароль обновлён. Теперь можно войти с новым паролем.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              aria-invalid={!!error}
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Пароль
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Ваш пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              aria-invalid={!!error}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">{error}</p>
          )}

          {unverifiedEmail && (
            <div className="rounded-3xl border border-border/80 bg-card/80 px-4 py-4 text-sm text-muted-foreground">
              <p className="mb-3">
                Почта для аккаунта <span className="font-medium text-foreground">{unverifiedEmail}</span> ещё не подтверждена.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}>
                  Ввести код подтверждения
                </Link>
              </Button>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="mt-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Вход...
              </>
            ) : (
              'Войти'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`} className="text-sm text-muted-foreground hover:text-foreground">
            Забыли пароль?
          </Link>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Нет аккаунта?{' '}
            <Link href="/register" className="font-medium text-foreground hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>

        {!isDesktopApp && (
          <>
            <div className="mt-4 text-center">
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                Посмотреть тарифы
              </Link>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
              В браузере доступны заметки, проекты и задачи. Голосовой помощник и плавающий виджет работают в приложении для desktop.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginPageContent />
    </Suspense>
  )
}
