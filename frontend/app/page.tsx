import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle2, Zap, Shield, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <FileText className="h-4 w-4 text-background" />
            </div>
            <span className="font-semibold text-foreground">ОКАК</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Тарифы
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Начать бесплатно</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 py-24 text-center">
          <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground md:text-6xl">
            Все ваши заметки, задачи и файлы в одном месте
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            ОКАК помогает организовать работу и личные проекты. Быстрый доступ через overlay, 
            мощный поиск и интуитивный интерфейс.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">
                Начать бесплатно
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Демо-аккаунт</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Демо: demo@example.com / demo123
          </p>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-muted/30 py-24">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
              Почему ОКАК?
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/10">
                  <Zap className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Быстрый доступ</h3>
                <p className="text-sm text-muted-foreground">
                  Overlay-интерфейс позволяет мгновенно создавать заметки и задачи 
                  через Ctrl+Space из любого места.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/10">
                  <CheckCircle2 className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Все в одном</h3>
                <p className="text-sm text-muted-foreground">
                  Заметки, задачи, проекты и файлы - управляйте всем из единого 
                  интерфейса с мощным поиском.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/10">
                  <Shield className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Надежность</h3>
                <p className="text-sm text-muted-foreground">
                  Ваши данные в безопасности. Локальное хранение с возможностью 
                  синхронизации между устройствами.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Начните организовывать свою работу уже сегодня
            </h2>
            <p className="mt-4 text-muted-foreground">
              Бесплатный план включает все основные функции. Без ограничений по времени.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild>
                <Link href="/register">
                  Создать аккаунт
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
                <FileText className="h-3 w-3 text-background" />
              </div>
              <span className="text-sm font-medium text-foreground">ОКАК</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 ОКАК. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
