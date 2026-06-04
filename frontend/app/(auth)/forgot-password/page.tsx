'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { KeyRound, Loader2, RefreshCcw } from 'lucide-react'
import { BrandMark } from '@/components/brand-mark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authApi, ApiError } from '@/lib/api'

const errorMessages: Record<string, string> = {
  not_found: 'Аккаунт с таким email не найден',
  invalid_reset_code: 'Код сброса введён неверно',
  reset_code_expired: 'Код истёк. Запросите новый',
  email_send_failed: 'Не удалось отправить письмо. Попробуйте ещё раз позже',
}

function ForgotPasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialEmail = useMemo(() => searchParams.get('email') ?? '', [searchParams])

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRequestStage, setIsRequestStage] = useState(true)

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      setError('Введите email')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await authApi.forgotPassword(normalizedEmail)
      setMessage(response.message)
      setIsRequestStage(false)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(errorMessages[err.code] ?? err.message)
      } else {
        setError('Не удалось отправить код')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
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

    if (newPassword.length < 8) {
      setError('Новый пароль должен быть не менее 8 символов')
      return
    }

    setIsSubmitting(true)
    try {
      await authApi.resetPassword(normalizedEmail, normalizedCode, newPassword)
      router.push(`/login?reset=success&email=${encodeURIComponent(normalizedEmail)}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(errorMessages[err.code] ?? err.message)
      } else {
        setError('Не удалось обновить пароль')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,180,160,0.12),transparent_34%),linear-gradient(180deg,rgba(246,250,252,0.98),rgba(255,255,255,1))]" />
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-[0_24px_80px_rgba(31,52,125,0.12)] backdrop-blur">
        <div className="grid gap-0 md:grid-cols-[1.02fr_0.98fr]">
          <div className="border-b border-border/60 bg-[linear-gradient(160deg,rgba(9,114,107,0.96),rgba(10,88,133,0.96))] px-8 py-10 text-white md:border-b-0 md:border-r">
            <BrandMark className="mb-6" />
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              <KeyRound className="h-3.5 w-3.5" />
              Смена пароля
            </div>
            <h1 className="max-w-sm text-3xl font-semibold leading-tight">
              Восстановим доступ без лишней боли
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/78">
              Сначала отправим код на почту, затем вы зададите новый пароль и вернётесь во вход без поддержки и ручных действий.
            </p>
          </div>

          <div className="px-8 py-10">
            <h2 className="text-2xl font-semibold text-foreground">Смена пароля</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isRequestStage ? 'Введите email, и мы отправим код для смены пароля.' : 'Введите код из письма и новый пароль.'}
            </p>

            <form onSubmit={isRequestStage ? handleRequestCode : handleResetPassword} className="mt-8 flex flex-col gap-4">
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
                  disabled={isSubmitting}
                />
              </div>

              {!isRequestStage && (
                <>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="code" className="text-sm font-medium text-foreground">
                      Код из письма
                    </label>
                    <Input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      disabled={isSubmitting}
                      className="text-center text-lg tracking-[0.45em]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="new-password" className="text-sm font-medium text-foreground">
                      Новый пароль
                    </label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Минимум 8 символов"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                    />
                  </div>
                </>
              )}

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
                    Подождите...
                  </>
                ) : isRequestStage ? (
                  'Отправить код'
                ) : (
                  'Сохранить новый пароль'
                )}
              </Button>

              {!isRequestStage && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsRequestStage(true)
                    setCode('')
                    setNewPassword('')
                    setMessage('')
                    setError('')
                  }}
                  className="h-11"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Запросить код заново
                </Button>
              )}
            </form>

            <div className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href={`/login${email ? `?email=${encodeURIComponent(email)}` : ''}`} className="hover:text-foreground">
                Вернуться ко входу
              </Link>
              <Link href={`/verify-email${email ? `?email=${encodeURIComponent(email)}` : ''}`} className="hover:text-foreground">
                Если не дошло письмо регистрации, перейти к подтверждению почты
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ForgotPasswordPageContent />
    </Suspense>
  )
}
