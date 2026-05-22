'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  FileText,
  FolderKanban,
  Search,
  Sparkles,
  StickyNote,
  CheckSquare,
  Files,
  Zap,
  Keyboard,
  Shield,
  TrendingUp,
  Clock,
  Globe,
} from 'lucide-react'

/* ---------- data ---------- */
const features = [
  {
    title: 'Заметки',
    description: 'Фиксируйте идеи, мысли и наброски в удобном редакторе. Закрепляйте важное наверху.',
    icon: StickyNote,
  },
  {
    title: 'Задачи',
    description: 'Ведите Kanban-доску с тремя статусами: к выполнению, в работе и выполнено.',
    icon: CheckSquare,
  },
  {
    title: 'Проекты',
    description: 'Объединяйте заметки, задачи и файлы в проекты с уникальными цветами.',
    icon: FolderKanban,
  },
  {
    title: 'Файлы',
    description: 'Загружайте документы и изображения через drag-and-drop с привязкой к проектам.',
    icon: Files,
  },
  {
    title: 'Overlay',
    description: 'Создавайте заметки и задачи мгновенно из любого места приложения — Cmd+Space.',
    icon: Zap,
  },
  {
    title: 'Поиск',
    description: 'Находите материалы по названию и содержимому через полнотекстовый поиск.',
    icon: Search,
  },
]

const steps = [
  {
    step: '01',
    title: 'Создайте проект',
    description: 'Задайте название, описание и цвет — ваше рабочее пространство готово.',
  },
  {
    step: '02',
    title: 'Добавьте материалы',
    description: 'Создавайте заметки, задачи и загружайте файлы с привязкой к проекту.',
  },
  {
    step: '03',
    title: 'Находите мгновенно',
    description: 'Используйте overlay или поиск, чтобы получить доступ к нужной информации.',
  },
]

const highlights = [
  { icon: Shield, label: 'Ваши данные защищены', value: 'Только вы имеете доступ' },
  { icon: Keyboard, label: 'Горячие клавиши', value: 'Cmd+Space для overlay' },
  { icon: Clock, label: 'Работает везде', value: 'Веб и десктоп' },
  { icon: Globe, label: 'На русском языке', value: 'Полная локализация' },
]

/* ---------- component ---------- */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      const x = (clientX / innerWidth - 0.5) * 20
      const y = (clientY / innerHeight - 0.5) * 20
      heroRef.current.style.setProperty('--mx', `${x}px`)
      heroRef.current.style.setProperty('--my', `${y}px`)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* floating gradient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -left-[10%] -top-[10%] h-[50vw] w-[50vw] rounded-full bg-blue/[0.07] blur-[120px]"
          style={{ transform: 'translate(var(--mx, 0), var(--my, 0))' }}
        />
        <div
          className="absolute -bottom-[10%] -right-[10%] h-[50vw] w-[50vw] rounded-full bg-lime/[0.07] blur-[120px]"
          style={{ transform: 'translate(calc(var(--mx, 0) * -1), calc(var(--my, 0) * -1))' }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue to-blue-dark shadow-lg shadow-blue/20">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">ОКАК</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {[
              { href: '#features', label: 'Возможности' },
              { href: '#workflow', label: 'Как работает' },
              { href: '/pricing', label: 'Тарифы' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Войти</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-gradient-to-r from-blue to-blue-dark text-white shadow-lg shadow-blue/20 hover:shadow-blue/30"
            >
              <Link href="/register">Начать бесплатно</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section ref={heroRef} className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-32 md:pb-40">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-blue" />
              Рабочее пространство для заметок, задач и файлов
              <span className="ml-1 rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                Free
              </span>
            </div>

            <h1 className="text-balance text-5xl font-extrabold tracking-tight text-foreground md:text-7xl lg:text-8xl">
              Мысли. Дела.{' '}
              <span className="bg-gradient-to-r from-blue via-blue-dark to-blue bg-clip-text text-transparent">
                Порядок.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-pretty text-xl leading-relaxed text-muted-foreground">
              ОКАК объединяет заметки, задачи, проекты и файлы в единую систему.
              Без хаоса, переключений между вкладками и потерянных идей.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="h-12 bg-gradient-to-r from-blue to-blue-dark px-8 text-white shadow-xl shadow-blue/25 hover:shadow-blue/40"
              >
                <Link href="/register">
                  Начать бесплатно
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                <Link href="/login">Войти в аккаунт</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              {['Без карты', 'Без рекламы', 'Ваши данные — ваши'].map((text) => (
                <span key={text} className="inline-flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-lime" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Hero visual - app mockup */}
          <div className="mx-auto mt-20 max-w-5xl">
            <div className="relative rounded-3xl border border-border bg-card p-2 shadow-2xl shadow-blue/5 md:p-3">
              <div className="rounded-2xl border border-border bg-background p-6 md:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex h-8 items-center gap-1.5 rounded-lg bg-muted px-3 text-xs font-medium text-muted-foreground">
                    <Keyboard className="h-3.5 w-3.5" />
                    Cmd + Space
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {/* Card 1 - pinned note */}
                  <div className="col-span-2 rounded-2xl bg-gradient-to-br from-blue to-blue-dark p-6 text-white shadow-lg">
                    <div className="mb-4 flex items-center gap-2">
                      <StickyNote className="h-5 w-5" />
                      <span className="text-sm font-medium opacity-80">Заметка</span>
                    </div>
                    <h3 className="text-xl font-bold">Концепция нового продукта</h3>
                    <p className="mt-2 text-sm leading-relaxed opacity-80">
                      Основная идея — объединить все рабочие инструменты в одном месте,
                      чтобы не переключаться между вкладками.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs">#продукт</span>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs">#идеи</span>
                    </div>
                  </div>

                  {/* Card 2 - task */}
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-lime">
                      <CheckSquare className="h-5 w-5 text-black" />
                    </div>
                    <p className="font-semibold">Задачи проекта</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">7</p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      5 выполнено
                    </div>
                  </div>

                  {/* Card 3 - file */}
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue/10">
                      <Files className="h-5 w-5 text-blue" />
                    </div>
                    <p className="font-semibold">Файлы</p>
                    <p className="mt-1 text-sm text-muted-foreground">12 документов</p>
                  </div>

                  {/* Card 4 - search */}
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue/10">
                      <Search className="h-5 w-5 text-blue" />
                    </div>
                    <p className="font-semibold">Поиск</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      По заметкам, задачам и файлам
                    </p>
                  </div>

                  {/* Card 5 - project */}
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue/10">
                      <FolderKanban className="h-5 w-5 text-blue" />
                    </div>
                    <p className="font-semibold">Проекты</p>
                    <p className="mt-1 text-sm text-muted-foreground">3 активных проекта</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative border-y border-border bg-muted/20 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 text-center">
              <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
                Всё необходимое —{' '}
                <span className="text-blue">в одном месте</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Замените набор разрозненных инструментов единой системой для продуктивной работы.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue/5"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue/10 to-blue/5 transition-transform duration-300 group-hover:scale-110">
                    <feature.icon className="h-6 w-6 text-blue" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                  <span className="absolute right-4 top-4 text-5xl font-bold text-foreground/[0.03]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 text-center">
            <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Начните за <span className="text-blue">3 шага</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              От идеи до результата — минимум настроек, максимум пользы.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((item, i) => (
              <div key={item.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-border to-transparent md:block" style={{ marginLeft: '50%' }} />
                )}
                <div className="relative rounded-2xl border border-border bg-card p-8 text-center">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue to-blue-dark text-lg font-bold text-white shadow-lg shadow-blue/20">
                    {item.step}
                  </span>
                  <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Highlights bar */}
        <section className="border-y border-border bg-muted/20 py-12">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue/10 to-blue/5">
                  <item.icon className="h-5 w-5 text-blue" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue via-blue to-blue-dark px-8 py-16 text-center text-white shadow-2xl shadow-blue/20 md:px-16 md:py-20">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-lime/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
                Готовы навести порядок?
              </h2>
              <p className="mt-6 text-lg text-white/80">
                Бесплатный план без ограничений по времени. Заметки, задачи,
                проекты и файлы — всё доступно сразу.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  asChild
                  className="h-12 bg-lime px-8 text-base font-semibold text-black shadow-xl shadow-black/10 hover:bg-lime-dark"
                >
                  <Link href="/register">
                    Создать аккаунт
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-12 border-white/30 bg-white/10 px-8 text-white hover:bg-white/20 hover:text-white"
                >
                  <Link href="/pricing">Тарифы</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/10 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue to-blue-dark">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">ОКАК</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/pricing" className="hover:text-foreground">Тарифы</Link>
              <Link href="/login" className="hover:text-foreground">Войти</Link>
              <Link href="/register" className="hover:text-foreground">Регистрация</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 ОКАК
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
