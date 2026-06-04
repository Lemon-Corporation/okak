'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, MailCheck, RefreshCcw } from 'lucide-react'
import { BrandMark } from '@/components/brand-mark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authApi, ApiError } from '@/lib/api'
import { getStoredClientMode } from '@/lib/client-mode'
import { desktopBroadcast, isElectron } from '@/lib/electron'
import { useAppStore } from '@/lib/store'

const errorMessages: Record<string, string> = {
  not_found: 'Аккаунт с таким email не найден',
  invalid_verification_code: 'Код введён неверно',
  verification_code_expired: 'Код истёк. Запросите новый',
  email_already_verified: 'Почта уже подтверждена',
  email_send_failed: 'Не удалось отправить письмо. Попробуйте ещё раз позже',
}

function VerifyEmailPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const completeAuth = useAppStore((state) => state.completeAuth)
  const initialEmail = useMemo(() => searchParams.get('email') ?? '', [searchParams])

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const redirectAfterAuth = () => {
    if (isElectron()) {
      router.push('/space')
      return
    }

    if (getStoredClientMode() === 'browser') {
      router.push('/space')
      return
    }

    router.push('/getting-started')
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const normalizedEmail = email.trim()
    const normalizedCode = code.trim()

    if (!normalizedEmail) {
      setError('Введите email')
      return
    }

    if (normalizedCode.length !== 6) {
      setError('Введите 6-значный код из письма')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await authApi.verifyEmail(normalizedEmail, normalizedCode)
      completeAuth(result)
      desktopBroadcast('app:start-tour', { name: result.user.display_name })
      redirectAfterAuth()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(errorMessages[err.code] ?? err.message)
      } else {
        setError('Не удалось подтвердить почту')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setMessage('')

    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      setError('Сначала введите email, на который регистрировались')
      return
    }

    setIsResending(true)
    try {
      const response = await authApi.resendVerification(normalizedEmail)
      setMessage(response.message)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(errorMessages[err.code] ?? err.message)
      } else {
        setError('Не удалось отправить новый код')
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(72,98,255,0.14),transparent_34%),linear-gradient(180deg,rgba(247,249,255,0.98),rgba(255,255,255,1))]" />
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-[0_24px_80px_rgba(31,52,125,0.14)] backdrop-blur">
        <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-border/60 bg-[linear-gradient(160deg,rgba(73,56,255,0.98),rgba(27,52,171,0.96))] px-8 py-10 text-white md:border-b-0 md:border-r">
            <BrandMark className="mb-6" />
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              <MailCheck className="h-3.5 w-3.5" />
              Проверка почты
            </div>
            <h1 className="max-w-sm text-3xl font-semibold leading-tight">
              Остался один шаг до входа в ОКАК
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/78">
              Мы отправили код подтверждения на вашу почту. После ввода кода аккаунт активируется, и мы сразу пустим вас в рабочее пространство.
            </p>
            <div className="mt-8 rounded-[1.5rem] border border-white/15 bg-white/8 p-5">
              <p className="text-sm font-medium text-white">Что дальше</p>
              <p className="mt-2 text-sm leading-6 text-white/76">
                Если хотите голосового помощника и виджет поверх всех окон, после входа скачайте desktop-приложение. В браузере тоже можно работать, но без голоса.
              </p>
            </div>
          </div>

          <div className="px-8 py-10">
            <h2 className="text-2xl font-semibold text-foreground">Подтвердить почту</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Введите email и 6-значный код из письма.
            </p>

            <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-4">
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
                  autoComplete="email"
                  disabled={isSubmitting || isResending}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="code" className="text-sm font-medium text-foreground">
                  Код подтверждения
                </label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isSubmitting || isResending}
                  className="text-center text-lg tracking-[0.45em]"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive">{error}</p>
              )}

              {message && (
                <p className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </p>
              )}

              <Button type="submit" disabled={isSubmitting} className="mt-2 h-11">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Подтверждаем...
                  </>
                ) : (
                  'Подтвердить и войти'
                )}
              </Button>

              <Button type="button" variant="outline" disabled={isSubmitting || isResending} onClick={handleResend} className="h-11">
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Отправляем код...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4" />
                    Отправить код ещё раз
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground">
                Уже есть код и хотите просто войти позже? Вернуться ко входу
              </Link>
              <Link href="/register" className="hover:text-foreground">
                Ошиблись в email? Создать аккаунт заново
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <VerifyEmailPageContent />
    </Suspense>
  )
}
