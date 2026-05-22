'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  Check,
  FileText,
  Sparkles,
  Zap,
  Shield,
  Users,
} from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '0',
    period: '/месяц',
    description: 'Для личного старта',
    icon: Zap,
    popular: false,
    accent: false,
    features: [
      'До 50 заметок',
      'До 100 задач',
      '3 проекта',
      '100 МБ хранилища',
      'Базовый поиск',
    ],
    cta: 'Начать бесплатно',
    ctaHref: '/register',
  },
  {
    name: 'Pro',
    price: '9',
    period: '/месяц',
    description: 'Для продвинутых',
    icon: Sparkles,
    popular: true,
    accent: true,
    features: [
      'Безлимитные заметки',
      'Безлимитные задачи',
      'Безлимитные проекты',
      '10 ГБ хранилища',
      'Расширенный поиск',
      'Приоритетная поддержка',
      'API доступ',
    ],
    cta: 'Выбрать Pro',
    ctaHref: '/register',
  },
  {
    name: 'Team',
    price: '19',
    period: '/месяц',
    description: 'Для команд и организаций',
    icon: Users,
    popular: false,
    accent: false,
    features: [
      'Всё из Pro',
      'Командное пространство',
      '100 ГБ хранилища',
      'Совместная работа',
      'Роли и права доступа',
      'Аналитика и отчёты',
      'SSO интеграция',
    ],
    cta: 'Выбрать Team',
    ctaHref: '/register',
  },
]

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

export default function PricingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* Header */}
      <header className="liquid-glass-header fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />
          <div className="flex items-center gap-2">
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
        </div>
      </header>

      <main className="relative isolate px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        {/* Background blobs */}
        <div className="absolute left-[5%] top-[10%] -z-10 h-80 w-80 rounded-full bg-lime/20 blur-3xl" />
        <div className="absolute right-[3%] top-[5%] -z-10 h-96 w-96 rounded-full bg-blue/15 blur-3xl" />
        <div className="absolute bottom-[10%] left-[40%] -z-10 h-72 w-72 rounded-full bg-blue/10 blur-3xl" />

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <div className="liquid-glass mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground">
            <Sparkles className="h-4 w-4 text-blue" />
            14 дней бесплатно на любом плане
          </div>
          <h1 className="text-balance text-5xl font-black tracking-[-0.05em] text-foreground sm:text-6xl">
            Простые{' '}
            <span className="relative inline-block">
              <span className="text-blue">тарифы</span>
              <span className="absolute -bottom-1 left-0 right-0 -z-10 h-3 rounded-full bg-lime/35" />
            </span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Начните бесплатно. Переходите на платный план только тогда, когда вам это действительно нужно.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12, duration: 0.55 }}
                className={`relative flex flex-col rounded-[2rem] p-7 transition duration-300 hover:-translate-y-1 ${
                  plan.accent
                    ? 'bg-blue text-white shadow-2xl shadow-blue/30'
                    : 'liquid-glass hover:shadow-xl hover:shadow-blue/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-lime px-4 py-1.5 text-xs font-black text-black shadow-lg">
                      Популярный
                    </span>
                  </div>
                )}

                <div className="mb-6 flex items-center justify-between">
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${
                      plan.accent ? 'bg-white/20' : 'bg-blue/10'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${plan.accent ? 'text-white' : 'text-blue'}`} />
                  </div>
                  {plan.accent && (
                    <Shield className="h-5 w-5 text-lime" />
                  )}
                </div>

                <h2 className={`text-2xl font-black ${plan.accent ? 'text-white' : 'text-foreground'}`}>
                  {plan.name}
                </h2>
                <p className={`mt-1 text-sm font-semibold ${plan.accent ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {plan.description}
                </p>

                <div className="mt-5 flex items-end gap-1">
                  <span className={`text-5xl font-black tracking-tight ${plan.accent ? 'text-white' : 'text-foreground'}`}>
                    ${plan.price}
                  </span>
                  <span className={`mb-1.5 text-sm font-semibold ${plan.accent ? 'text-white/60' : 'text-muted-foreground'}`}>
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-7 flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.accent ? 'bg-white/20' : 'bg-blue/10'
                        }`}
                      >
                        <Check className={`h-3 w-3 ${plan.accent ? 'text-lime' : 'text-blue'}`} />
                      </div>
                      <span className={`text-sm leading-5 ${plan.accent ? 'text-white/85' : 'text-foreground'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  asChild
                  className={`mt-8 h-12 rounded-2xl text-base font-bold ${
                    plan.accent
                      ? 'bg-lime text-black hover:bg-lime-dark shadow-xl shadow-black/20'
                      : plan.name === 'Free'
                      ? 'liquid-glass border-0 text-foreground hover:-translate-y-0 hover:bg-transparent'
                      : 'bg-blue text-white hover:bg-blue-dark shadow-lg shadow-blue/25'
                  }`}
                >
                  <Link href={plan.ctaHref}>
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-sm font-medium text-muted-foreground"
        >
          Все планы включают 14-дневный бесплатный пробный период.{' '}
          <Link href="/login" className="font-bold text-blue underline underline-offset-2">
            Начать пробный период
          </Link>
        </motion.p>
      </main>
    </div>
  )
}
