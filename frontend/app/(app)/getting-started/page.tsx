'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { setStoredClientMode } from '@/lib/client-mode'
import { detectDesktopPlatform, fetchLatestDesktopRelease, type DesktopPlatform } from '@/lib/releases'
import {
  Apple,
  ArrowRight,
  Box,
  CheckCircle2,
  Command,
  Download,
  Mic,
  Monitor,
  Sparkles,
} from 'lucide-react'

const osMeta: Record<DesktopPlatform, { icon: React.ElementType; label: string }> = {
  macos: { icon: Apple, label: 'macOS' },
  windows: { icon: Monitor, label: 'Windows' },
  linux: { icon: Box, label: 'Linux' },
  other: { icon: Download, label: 'вашей системы' },
}

const desktopBenefits = [
  'Голосовой помощник и плавающий виджет поверх любых окон',
  'Быстрые голосовые команды для задач, заметок и навигации',
  'Нативные уведомления и быстрый доступ без открытия вкладки',
]

export default function GettingStartedPage() {
  const router = useRouter()
  const [platform, setPlatform] = useState<DesktopPlatform>('other')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [releasePageUrl, setReleasePageUrl] = useState('https://github.com/Lemon-Corporation/okak-release/releases/latest')
  const [version, setVersion] = useState('')

  useEffect(() => {
    const currentPlatform = detectDesktopPlatform()
    setPlatform(currentPlatform)

    void fetchLatestDesktopRelease(currentPlatform).then((release) => {
      setDownloadUrl(release.downloadUrl)
      setReleasePageUrl(release.releasePageUrl)
      setVersion(release.version)
    })
  }, [])

  const platformMeta = osMeta[platform]
  const PlatformIcon = platformMeta.icon

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue/10 px-3 py-1.5 text-sm font-semibold text-blue">
            <Sparkles className="h-4 w-4" />
            Добро пожаловать в ОКАК
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Начните с приложения, чтобы получить полный опыт с голосом
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            В браузере вы можете работать с заметками, задачами, проектами и файлами. Для голосового помощника, плавающего виджета и быстрых голосовых команд скачайте приложение.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-blue/20 shadow-xl shadow-blue/10">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue text-white">
                <Command className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Рекомендуемый сценарий: скачать приложение</CardTitle>
              <CardDescription>
                Установите ОКАК на {platformMeta.label}, войдите под тем же аккаунтом и получите голосовой режим с виджетом.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3">
                {desktopBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3 rounded-2xl bg-muted/60 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
                    <span className="text-sm text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 bg-blue text-white shadow-lg shadow-blue/25 hover:bg-blue-dark"
                >
                  <a href={downloadUrl ?? releasePageUrl} target="_blank" rel="noreferrer">
                    <PlatformIcon className="h-4 w-4" />
                    Скачать для {platformMeta.label}
                  </a>
                </Button>

                <Button asChild size="lg" variant="outline" className="h-12">
                  <Link href="/download">
                    Инструкция по установке
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Что делать дальше</p>
                <p className="mt-1">
                  1. Скачайте приложение. 2. Установите его. 3. Войдите под этим же аккаунтом. 4. Используйте голосовой виджет и помощника.
                </p>
                {version && <p className="mt-2 text-xs">Текущий релиз: {version}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-foreground">
                <Mic className="h-6 w-6" />
              </div>
              <CardTitle>Или продолжайте в браузере</CardTitle>
              <CardDescription>
                Этот режим подойдёт, если вам нужно быстро начать работу прямо сейчас, без установки.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                В браузере будут доступны заметки, задачи, проекты, файлы и поиск. Голосовой помощник и виджет останутся недоступны до установки приложения.
              </div>

              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full"
                onClick={() => {
                  setStoredClientMode('browser')
                  router.push('/space')
                }}
              >
                Продолжить в браузере
              </Button>

              <p className="text-xs leading-5 text-muted-foreground">
                Вы сможете скачать приложение позже из любого экрана. Мы напомним, что голосовой режим доступен только в desktop-версии.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
