'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Download, MicOff } from 'lucide-react'

export function WebModeBanner() {
  return (
    <div className="border-b border-blue/15 bg-blue/5 px-4 py-3">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue text-white shadow-lg shadow-blue/20">
            <MicOff className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Вы в браузерном режиме</p>
            <p className="text-sm text-muted-foreground">
              Веб-версия подходит для заметок, задач и проектов. Голосовой помощник и плавающий виджет доступны только в приложении.
            </p>
          </div>
        </div>

        <Button asChild className="bg-blue text-white hover:bg-blue-dark">
          <Link href="/download">
            <Download className="h-4 w-4" />
            Скачать приложение
          </Link>
        </Button>
      </div>
    </div>
  )
}
