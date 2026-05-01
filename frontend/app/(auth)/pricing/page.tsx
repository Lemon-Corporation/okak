import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Для личного использования',
    features: [
      'До 50 заметок',
      'До 100 задач',
      '3 проекта',
      '100 МБ хранилища',
      'Базовый поиск',
    ],
    cta: 'Начать бесплатно',
    popular: false,
  },
  {
    name: 'Pro',
    price: '9',
    description: 'Для продвинутых пользователей',
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
    popular: true,
  },
  {
    name: 'Team',
    price: '19',
    description: 'Для команд и организаций',
    features: [
      'Все из Pro',
      'Командное пространство',
      '100 ГБ хранилища',
      'Совместная работа',
      'Роли и права доступа',
      'Аналитика и отчеты',
      'SSO интеграция',
    ],
    cta: 'Выбрать Team',
    popular: false,
  },
]

export default function PricingPage() {
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Войти</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Регистрация</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground">Тарифные планы</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Выберите план, который подходит именно вам
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? 'relative border-foreground' : ''}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                    Популярный
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                  <span className="text-muted-foreground">/месяц</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-foreground" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href="/register">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Все планы включают 14-дневный бесплатный пробный период.{' '}
            <Link href="/login" className="text-foreground underline">
              Начать пробный период
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
