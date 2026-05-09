import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  CheckCircle2,
  Command,
  FileText,
  FolderKanban,
  Search,
  Shield,
  Sparkles,
  StickyNote,
  Zap,
} from 'lucide-react'

const features = [
  {
    title: 'Быстрый доступ',
    description:
      'Создавайте заметки, задачи и файлы через overlay из любого места приложения.',
    icon: Zap,
  },
  {
    title: 'Единое рабочее пространство',
    description:
      'Проекты, заметки, задачи и документы собраны в одной понятной системе.',
    icon: FolderKanban,
  },
  {
    title: 'Поиск без лишних действий',
    description:
      'Находите нужные материалы по заметкам, проектам, задачам и файлам.',
    icon: Search,
  },
]

const stats = [
  { value: '50+', label: 'заметок в Free' },
  { value: '100+', label: 'задач для личной работы' },
  { value: '3', label: 'проекта на старте' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue shadow-sm">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              ОКАК
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Возможности
            </a>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Тарифы
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild className="bg-blue text-white hover:bg-blue-dark">
              <Link href="/register">Начать</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-[1.05fr_0.95fr] md:py-28">
          <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-lime/30 blur-3xl" />
          <div className="absolute right-0 top-32 -z-10 h-80 w-80 rounded-full bg-blue/15 blur-3xl" />

          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-blue" />
              Рабочее пространство для заметок, задач и файлов
            </div>

            <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Все важное — в одном месте
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
              ОКАК помогает быстро фиксировать идеи, вести проекты, хранить файлы
              и возвращаться к нужной информации без хаоса в разных сервисах.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-blue text-white hover:bg-blue-dark">
                <Link href="/register">
                  Начать бесплатно
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Открыть демо</Link>
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-blue" />
                Демо: demo@example.com / demo123
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-border bg-card p-4 shadow-2xl shadow-blue/10">
              <div className="rounded-[1.5rem] border border-border bg-background p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Сегодня</p>
                    <p className="text-xs text-muted-foreground">Рабочее пространство</p>
                  </div>
                  <div className="flex h-9 items-center gap-1 rounded-full bg-muted px-3 text-xs font-medium text-muted-foreground">
                    <Command className="h-3.5 w-3.5" />
                    Space
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl bg-blue p-5 text-white shadow-lg shadow-blue/20">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                        <StickyNote className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-lime px-3 py-1 text-xs font-semibold text-black">
                        Новое
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold">План запуска проекта</h2>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      Добавьте заметку, задачу или файл и сразу привяжите их к
                      нужному проекту.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-lime">
                        <CheckCircle2 className="h-5 w-5 text-black" />
                      </div>
                      <p className="font-medium text-foreground">Задачи</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        12 активных
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue/10">
                        <Shield className="h-5 w-5 text-blue" />
                      </div>
                      <p className="font-medium text-foreground">Файлы</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Защищенное хранение
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/30 py-10">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl bg-card p-5 text-center shadow-sm">
                <p className="text-3xl font-bold text-blue">{item.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-24">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Все, что нужно для спокойной работы
            </h2>
            <p className="mt-4 text-muted-foreground">
              Интерфейс остается простым, но закрывает основные сценарии:
              быстро записать, найти, организовать и продолжить работу.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue/10">
                  <feature.icon className="h-6 w-6 text-blue" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-blue px-6 py-12 text-center text-white shadow-xl shadow-blue/20 md:px-12">
            <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-lime/30 blur-2xl" />
            <div className="absolute -bottom-20 right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Начните организовывать работу уже сегодня
              </h2>
              <p className="mt-4 text-white/80">
                Бесплатный план подходит для старта: заметки, задачи, проекты и
                файлы доступны сразу после регистрации.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild className="bg-lime text-black hover:bg-lime-dark">
                  <Link href="/register">
                    Создать аккаунт
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <Link href="/pricing">Посмотреть тарифы</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue">
              <FileText className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground">ОКАК</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 ОКАК. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  )
}
