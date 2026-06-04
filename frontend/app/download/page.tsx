'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { setStoredClientMode } from '@/lib/client-mode'
import { detectDesktopPlatform, fetchLatestDesktopRelease, type DesktopPlatform } from '@/lib/releases'
import {
  Apple,
  ArrowLeft,
  ArrowRight,
  Box,
  CheckCircle2,
  Download,
  Mic,
  Monitor,
  Sparkles,
} from 'lucide-react'

const installSteps: Record<Exclude<DesktopPlatform, 'other'>, string[]> = {
  macos: [
    'Скачайте `.dmg` и откройте его.',
    'Перетащите OKAK в папку Applications.',
    'Запустите приложение и разрешите доступ к микрофону для голосового помощника.',
  ],
  windows: [
    'Скачайте `.exe` и запустите установщик.',
    'Если Windows покажет предупреждение, подтвердите запуск приложения.',
    'После установки откройте OKAK и разрешите доступ к микрофону.',
  ],
  linux: [
    'Скачайте `.AppImage`.',
    'Сделайте файл исполняемым и запустите его.',
    'При первом запуске дайте приложению доступ к микрофону, если система спросит.',
  ],
}

const platforms = [
  { id: 'macos', name: 'macOS', icon: Apple, ext: '.dmg' },
  { id: 'windows', name: 'Windows', icon: Monitor, ext: '.exe' },
  { id: 'linux', name: 'Linux', icon: Box, ext: '.AppImage' },
] as const

export default function DownloadPage() {
  const [os, setOs] = useState<DesktopPlatform>('other')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [releasePageUrl, setReleasePageUrl] = useState('https://github.com/Lemon-Corporation/okak-release/releases/latest')
  const [version, setVersion] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentOs = detectDesktopPlatform()
    setOs(currentOs)

    void fetchLatestDesktopRelease(currentOs)
      .then((release) => {
        setVersion(release.version)
        setDownloadUrl(release.downloadUrl)
        setReleasePageUrl(release.releasePageUrl)
      })
      .finally(() => setLoading(false))
  }, [])

  const currentSteps =
    os === 'macos' || os === 'windows' || os === 'linux'
      ? installSteps[os]
      : installSteps.macos

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="absolute left-8 top-8">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад на главную
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-5xl space-y-8 pt-20"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue/10 px-3 py-1.5 text-sm font-semibold text-blue">
            <Sparkles className="h-4 w-4" />
            Голосовой помощник доступен только в приложении
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Скачать <span className="text-blue">ОКАК</span>
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
            Для голосовых команд, плавающего виджета и нативных уведомлений установите desktop-приложение. Веб-версия тоже доступна, но работает без голоса.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {platforms.map((platform) => {
            const Icon = platform.icon
            const isCurrent = os === platform.id

            return (
              <Card key={platform.id} className={isCurrent ? 'border-blue-500 ring-1 ring-blue-500' : ''}>
                <CardHeader className="text-center">
                  <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl ${isCurrent ? 'bg-blue text-white' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{platform.name}</CardTitle>
                  <CardDescription>Desktop-версия ({platform.ext})</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  {isCurrent && downloadUrl ? (
                    <Button className="h-12 w-full rounded-xl bg-blue text-lg font-bold text-white hover:bg-blue-dark" asChild>
                      <a href={downloadUrl} target="_blank" rel="noreferrer">
                        <Download className="mr-2 h-5 w-5" />
                        Скачать сейчас
                      </a>
                    </Button>
                  ) : (
                    <Button variant="outline" className="h-12 w-full rounded-xl text-lg font-bold" asChild>
                      <a href={releasePageUrl} target="_blank" rel="noreferrer">
                        Выбрать версию
                      </a>
                    </Button>
                  )}

                  {isCurrent && (
                    <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-lime" />
                      Рекомендуется для вашей системы
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Что вы получите в приложении</CardTitle>
              <CardDescription>Desktop-версия открывает сценарий, которого нет в браузере.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                'Плавающий голосовой виджет поверх других приложений',
                'Быстрое создание заметок и задач через голос',
                'Нативные уведомления и удобный доступ без вкладки браузера',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-muted/60 px-4 py-3 text-sm">
                  <Mic className="mt-0.5 h-4 w-4 shrink-0 text-blue" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Как установить</CardTitle>
              <CardDescription>
                Короткий путь до первого запуска на {platforms.find((item) => item.id === os)?.name ?? 'вашей системе'}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentSteps.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-2xl bg-muted/60 px-4 py-3 text-sm">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-dashed border-blue/30">
          <CardHeader>
            <CardTitle>Нужно продолжить без установки?</CardTitle>
            <CardDescription>
              Веб-версия подходит для задач, заметок, проектов и файлов. Просто помните, что голосовой помощник и виджет останутся недоступны до установки приложения.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="h-12"
              onClick={() => {
                setStoredClientMode('browser')
                window.location.href = '/space'
              }}
            >
              Продолжить в браузере
            </Button>
            <Button asChild className="h-12 bg-blue text-white hover:bg-blue-dark">
              <Link href="/register">
                Создать аккаунт для desktop
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          {version && (
            <p>
              Текущий релиз: <span className="font-bold">{version}</span>
            </p>
          )}
          <p className="mt-2">После установки войдите под тем же аккаунтом и сразу получите доступ к голосовому виджету.</p>
          {loading && <p className="mt-2">Проверяем актуальный релиз…</p>}
        </div>
      </motion.div>
    </div>
  )
}
