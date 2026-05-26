'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Command,
  FileText,
  Files,
  FolderKanban,
  Layers3,
  Menu,
  MousePointer2,
  Search,
  Shield,
  Sparkles,
  StickyNote,
  Zap,
  ShieldCheck,
  Clock3,
  X,
  Download,
  Apple,
  Monitor,
  Box,
} from 'lucide-react'

const demoViews = ['capture', 'board', 'search'] as const
type DemoView = (typeof demoViews)[number]

const demoMeta: Record<DemoView, { label: string; icon: React.ElementType }> = {
  capture: { label: 'Захват', icon: Command },
  board: { label: 'Проекты', icon: FolderKanban },
  search: { label: 'Поиск', icon: Search },
}

const stats = [
  { value: '50+', label: 'заметок в Free' },
  { value: '100+', label: 'задач для личной работы' },
  { value: '3', label: 'проекта на старте' },
]

const features = [
  {
    title: 'Мгновенный захват',
    text: 'Оверлей открывается поверх любой задачи: идея, заметка, файл или todo сохраняются без потери контекста.',
    icon: Zap,
  },
  {
    title: 'Одна рабочая система',
    text: 'Проекты, задачи, заметки и файлы живут вместе — без прыжков между десятком вкладок и сервисов.',
    icon: Layers3,
  },
  {
    title: 'Поиск по всему',
    text: 'Один запрос ищет по содержимому, тегам, проектам и файлам. Быстро вернуться к нужному — реально.',
    icon: Search,
  },
]

const timeline = [
  {
    title: 'Записали мысль',
    text: 'Cmd+Space — и идея уже в системе.',
    icon: StickyNote,
  },
  {
    title: 'Привязали к проекту',
    text: 'Теги, приоритеты и файлы складываются в понятную структуру.',
    icon: FolderKanban,
  },
  {
    title: 'Нашли за секунду',
    text: 'Поиск возвращает заметки, задачи и файлы в одном списке.',
    icon: MousePointer2,
  },
]

function useTilt() {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 160, damping: 18 })
  const springY = useSpring(y, { stiffness: 160, damping: 18 })
  const rotateX = useTransform(springY, [-0.5, 0.5], ['7deg', '-7deg'])
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-8deg', '8deg'])

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = ref.current?.getBoundingClientRect()
    if (!bounds) return
    const px = (event.clientX - bounds.left) / bounds.width - 0.5
    const py = (event.clientY - bounds.top) / bounds.height - 0.5
    x.set(px)
    y.set(py)
  }

  const onMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave }
}

function CaptureDemo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <div className="liquid-glass rounded-[1.7rem] p-4">
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-3">
          <Command className="h-4 w-4 text-blue" />
          <span className="text-sm font-medium text-foreground">Новая заметка для проекта</span>
          <span className="ml-auto rounded-lg bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">⌘ Space</span>
        </div>
        <div className="rounded-2xl bg-muted/60 p-4">
          <p className="text-sm leading-6 text-foreground">
            Запустить MVP: финализировать дизайн, собрать README, проверить CI/CD и добавить быстрый импорт файлов.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['#mvp', '#frontend', '#запуск'].map((tag) => (
              <span key={tag} className="rounded-full bg-lime/25 px-3 py-1 text-xs font-semibold text-accent-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          ['Файл', Files],
          ['Задача', CheckSquare],
          ['Проект', FolderKanban],
        ].map(([label, Icon]) => {
          const DemoIcon = Icon as React.ElementType
          return (
            <div key={label as string} className="liquid-glass rounded-2xl p-3 text-center">
              <DemoIcon className="mx-auto mb-1 h-4 w-4 text-blue" />
              <p className="text-[11px] font-medium text-muted-foreground">{label as string}</p>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function BoardDemo() {
  const columns = [
    { title: 'Идеи', tone: 'bg-muted', items: ['Drag files', 'Командная палитра'] },
    { title: 'В работе', tone: 'bg-blue/10', items: ['API интеграция'] },
    { title: 'Готово', tone: 'bg-lime/20', items: ['Дизайн', 'БД схема'] },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid grid-cols-3 gap-3"
    >
      {columns.map((column) => (
        <div key={column.title} className="liquid-glass rounded-[1.4rem] p-3">
          <div className={`mb-3 rounded-xl px-2 py-1.5 text-center text-[11px] font-bold text-foreground ${column.tone}`}>
            {column.title}
          </div>
          <div className="space-y-2">
            {column.items.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-xl border border-border bg-background p-2 shadow-sm"
              >
                <p className="text-[11px] font-semibold leading-4 text-foreground">{item}</p>
                <div className="mt-2 h-1.5 rounded-full bg-muted">
                  <div className="h-full w-2/3 rounded-full bg-blue" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  )
}

function SearchDemo() {
  const [typed, setTyped] = useState('')
  const query = 'план запуска'

  useEffect(() => {
    let i = 0
    setTyped('')
    const timer = setInterval(() => {
      i += 1
      setTyped(query.slice(0, i))
      if (i >= query.length) clearInterval(timer)
    }, 75)
    return () => clearInterval(timer)
  }, [])

  const results = [
    ['План запуска проекта', 'Заметка · mvp · закреплено', StickyNote],
    ['Финализировать план', 'Задача · высокий приоритет', CheckSquare],
    ['Запуск продукта', 'Проект · 12 задач · 4 файла', FolderKanban],
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-3"
    >
      <div className="liquid-glass flex items-center gap-3 rounded-2xl px-4 py-3">
        <Search className="h-4 w-4 text-blue" />
        <span className="flex-1 text-sm font-medium text-foreground">
          {typed}
          <span className="animate-pulse text-blue">|</span>
        </span>
        <span className="rounded-lg bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground">⌘ K</span>
      </div>
      <div className="liquid-glass overflow-hidden rounded-[1.4rem]">
        {results.map(([title, subtitle, Icon], index) => {
          const ResultIcon = Icon as React.ElementType
          return (
            <div
              key={title as string}
              className={`flex items-center gap-3 px-4 py-3 ${index === 0 ? 'bg-blue/5' : ''} ${index !== results.length - 1 ? 'border-b border-border/50' : ''}`}
            >
              <div className={`grid h-9 w-9 place-items-center rounded-xl ${index === 0 ? 'bg-blue text-white' : 'bg-muted text-muted-foreground'}`}>
                <ResultIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{title as string}</p>
                <p className="truncate text-xs text-muted-foreground">{subtitle as string}</p>
              </div>
              {index === 0 && <ChevronRight className="h-4 w-4 text-blue" />}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function ProductStage() {
  const [view, setView] = useState<DemoView>('capture')
  const tilt = useTilt()

  useEffect(() => {
    const timer = setInterval(() => {
      setView((current) => demoViews[(demoViews.indexOf(current) + 1) % demoViews.length])
    }, 3900)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative mx-auto max-w-xl perspective-[1200px]">
      <motion.div
        ref={tilt.ref}
        style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className="liquid-glass relative rounded-[2.4rem] p-3 shadow-2xl shadow-blue/10"
      >
        <div className="liquid-glass-inner rounded-[2rem] p-4">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-lime" />
              </div>
              <span className="hidden text-xs font-semibold text-muted-foreground sm:block">OKAK workspace</span>
            </div>
            <div className="flex rounded-2xl bg-muted p-1">
              {demoViews.map((item) => {
                const Icon = demoMeta[item].icon
                return (
                  <button
                    key={item}
                    onClick={() => setView(item)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      view === item ? 'bg-blue text-white shadow-sm shadow-blue/25' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{demoMeta[item].label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="min-h-[272px]">
            {view === 'capture' && <CaptureDemo />}
            {view === 'board' && <BoardDemo />}
            {view === 'search' && <SearchDemo />}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -28, y: 16 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute -bottom-6 -left-3 hidden md:block"
      >
        <div className="liquid-glass rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-lime shadow-[0_0_18px_oklch(0.85_0.25_130)]" />
            <span className="text-xs font-bold text-foreground">Синхронизировано</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 26, y: -12 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
        className="absolute -right-3 top-10 hidden md:block"
      >
        <div className="liquid-glass rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue" />
            <span className="text-xs font-bold text-foreground">Файлы защищены</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function MobileNav() {
  const [open, setOpen] = useState(false)
  return (
    <div className="md:hidden">
      <button className="liquid-glass grid h-10 w-10 place-items-center rounded-xl" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[80] bg-background/95 p-4 backdrop-blur-xl">
          <div className="mb-8 flex items-center justify-between">
            <Brand />
            <button className="liquid-glass grid h-10 w-10 place-items-center rounded-xl" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-3">
            {[
              ['Как работает', '#how'],
              ['Возможности', '#features'],
              ['Тарифы', '/pricing'],
            ].map(([label, href]) => (
              <Link key={label} href={href} onClick={() => setOpen(false)} className="liquid-glass block rounded-2xl p-4 text-lg font-bold text-foreground">
                {label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue text-white shadow-lg shadow-blue/25">
        <FileText className="h-5 w-5" />
      </div>
      <span className="text-lg font-black tracking-tight text-foreground">ОКАК</span>
    </Link>
  )
}

function DownloadButton() {
  const [os, setOs] = useState<'macos' | 'windows' | 'linux' | 'other'>('other')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [version, setVersion] = useState<string>('')

  useEffect(() => {
    const platform = window.navigator.platform.toLowerCase()
    if (platform.includes('mac')) setOs('macos')
    else if (platform.includes('win')) setOs('windows')
    else if (platform.includes('linux')) setOs('linux')

    // Fetch latest release from GitHub
    fetch('https://api.github.com/repos/Lemon-Corporation/okak-release/releases/latest')
      .then((res) => res.json())
      .then((data) => {
        if (data.assets) {
          setVersion(data.tag_name)
          const currentOs = platform.includes('mac') ? 'macos' : platform.includes('win') ? 'windows' : platform.includes('linux') ? 'linux' : 'other'
          
          let asset;
          if (currentOs === 'macos') {
            asset = data.assets.find((a: any) => a.name.endsWith('.dmg'))
          } else if (currentOs === 'windows') {
            asset = data.assets.find((a: any) => a.name.endsWith('.exe'))
          } else if (currentOs === 'linux') {
            asset = data.assets.find((a: any) => a.name.endsWith('.AppImage'))
          }
          
          if (asset) setDownloadUrl(asset.browser_download_url)
        }
      })
      .catch(console.error)
  }, [])

  const osInfo = {
    macos: { label: 'macOS', icon: Apple },
    windows: { label: 'Windows', icon: Monitor },
    linux: { label: 'Linux', icon: Box },
    other: { label: 'Приложение', icon: Download },
  }

  const current = osInfo[os]
  const Icon = current.icon

  return (
    <Button
      size="lg"
      variant="outline"
      className="liquid-glass h-12 rounded-2xl border-0 px-6 text-base font-bold transition hover:-translate-y-0.5"
      onClick={() => {
        if (downloadUrl) {
          window.location.href = downloadUrl
        } else {
          window.open('https://github.com/Lemon-Corporation/okak-release/releases', '_blank')
        }
      }}
    >
      <Icon className="mr-2 h-4 w-4" />
      Скачать для {current.label}
      {version && <span className="ml-2 opacity-50 text-xs">{version}</span>}
    </Button>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="liquid-glass-header fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#how" className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
              Как работает
            </a>
            <a href="#features" className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
              Возможности
            </a>
            <Link href="/pricing" className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
              Тарифы
            </Link>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" asChild>
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild className="bg-blue text-white shadow-lg shadow-blue/25 hover:bg-blue-dark">
              <Link href="/register">
                Начать
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <MobileNav />
        </div>
      </header>

      <main>
        <section className="relative isolate px-4 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36 lg:px-8">
          {/* Static blobs — no JS animation, GPU-composited */}
          <div className="absolute left-[8%] top-[14%] -z-10 h-72 w-72 rounded-full bg-lime/25 blur-3xl" />
          <div className="absolute right-[4%] top-[8%] -z-10 h-96 w-96 rounded-full bg-blue/20 blur-3xl" />
          <div className="absolute bottom-[12%] left-[34%] -z-10 h-80 w-80 rounded-full bg-blue/10 blur-3xl" />

          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
            <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
              <div className="liquid-glass mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground">
                <Sparkles className="h-4 w-4 text-blue" />
                Рабочее пространство для заметок, задач и файлов
              </div>

              <h1 className="max-w-4xl text-balance text-5xl font-black tracking-[-0.06em] text-foreground sm:text-6xl lg:text-7xl xl:text-8xl">
                Всё важное —{' '}
                <span className="relative inline-block">
                  <span className="text-blue">в одном месте</span>
                  <span className="absolute -bottom-2 left-1 right-1 -z-10 h-3 rounded-full bg-lime/35" />
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
                ОКАК помогает быстро фиксировать идеи, вести проекты, хранить файлы и возвращаться к нужной информации без хаоса в разных сервисах.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  asChild
                  className="h-12 rounded-2xl bg-blue px-6 text-base font-bold text-white shadow-xl shadow-blue/25 transition hover:-translate-y-0.5 hover:bg-blue-dark hover:shadow-blue/35"
                >
                  <Link href="/register">
                    Начать бесплатно
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <DownloadButton />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground">
                <span className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue" />
                  demo@example.com / demo123
                </span>
                <span className="liquid-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
                  <Clock3 className="h-4 w-4 text-lime-700" />
                  старт за 30 секунд
                </span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }}>
              <ProductStage />
            </motion.div>
          </div>
        </section>

        <section className="border-y border-border/50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">
            {stats.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.08 }}
                className="liquid-glass rounded-[1.7rem] p-6 text-center"
              >
                <p className="text-4xl font-black tracking-tight text-blue">{item.value}</p>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-blue">workflow</p>
            <h2 className="text-balance text-4xl font-black tracking-tight text-foreground md:text-5xl">От идеи до результата — без лишних движений</h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">Лендинг продаёт простую мысль: всё важное можно записать, разложить и найти в одном месте.</p>
          </div>

          <div className="relative mt-16 grid gap-5 md:grid-cols-3">
            {timeline.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ delay: index * 0.12 }}
                  className="liquid-glass relative rounded-[2rem] p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue/10"
                >
                  <div className="mb-8 flex items-center justify-between">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue text-white shadow-lg shadow-blue/25">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-lime px-3 py-1 text-xs font-black text-black">0{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-black text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section id="features" className="border-y border-border/50 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-blue">features</p>
                <h2 className="text-balance text-4xl font-black tracking-tight text-foreground md:text-5xl">Спокойная работа вместо цифрового хаоса</h2>
              </div>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground lg:ml-auto">
                Визуально лендинг делает акцент на ощущении контроля: быстрый захват, понятная структура и мгновенный поиск.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ delay: index * 0.1 }}
                    className="liquid-glass group rounded-[2rem] p-7 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue/10"
                  >
                    <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-blue/10 transition group-hover:scale-105">
                      <Icon className="h-6 w-6 text-blue" />
                    </div>
                    <h3 className="text-xl font-black text-foreground">{feature.title}</h3>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{feature.text}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            className="relative overflow-hidden rounded-[2.4rem] bg-blue px-6 py-16 text-center text-white shadow-2xl shadow-blue/25 sm:px-12"
          >
            <div className="relative mx-auto max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-lime" />
                Бесплатно для старта
              </div>
              <h2 className="text-balance text-4xl font-black tracking-tight md:text-5xl">Начните организовывать работу уже сегодня</h2>
              <p className="mt-5 text-lg leading-8 text-white/80">
                Бесплатный план подходит для старта: заметки, задачи, проекты и файлы доступны сразу после регистрации.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild className="h-12 rounded-2xl bg-lime px-6 text-base font-black text-black shadow-xl shadow-black/20 hover:bg-lime-dark">
                  <Link href="/register">
                    Создать аккаунт
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-12 rounded-2xl border-white/30 bg-white/10 px-6 text-base font-black text-white backdrop-blur-xl hover:bg-white/20 hover:text-white"
                >
                  <Link href="/pricing">Посмотреть тарифы</Link>
                </Button>
              </div>
            </div>
          </motion.div>
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
