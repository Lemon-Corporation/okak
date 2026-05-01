'use client'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { User, CreditCard, Bell, Shield, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const user = useAppStore((state) => state.user)
  const logout = useAppStore((state) => state.logout)

  const planLabels = {
    free: 'Бесплатный',
    pro: 'Pro',
    team: 'Team',
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Настройки" />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col gap-6">
            {/* Profile */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">Профиль</CardTitle>
                    <CardDescription>Управление личными данными</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Имя</label>
                  <Input defaultValue={user?.name || ''} placeholder="Ваше имя" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input defaultValue={user?.email || ''} type="email" disabled />
                  <p className="text-xs text-muted-foreground">
                    Email нельзя изменить
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button>Сохранить</Button>
                </div>
              </CardContent>
            </Card>

            {/* Subscription */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">Подписка</CardTitle>
                    <CardDescription>Управление тарифным планом</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">
                      Текущий план: {planLabels[user?.plan || 'free']}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user?.plan === 'free'
                        ? 'Ограниченные возможности'
                        : 'Полный доступ ко всем функциям'}
                    </p>
                  </div>
                  <Button variant="outline">
                    {user?.plan === 'free' ? 'Обновить' : 'Управление'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">Уведомления</CardTitle>
                    <CardDescription>Настройка оповещений</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Email-уведомления</p>
                    <p className="text-sm text-muted-foreground">
                      Получать уведомления о задачах
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Напоминания</p>
                    <p className="text-sm text-muted-foreground">
                      Напоминания о сроках задач
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">Безопасность</CardTitle>
                    <CardDescription>Пароль и безопасность аккаунта</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Текущий пароль</label>
                  <Input type="password" placeholder="********" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Новый пароль</label>
                  <Input type="password" placeholder="Минимум 6 символов" />
                </div>
                <div className="flex justify-end">
                  <Button>Изменить пароль</Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  <div>
                    <CardTitle className="text-base text-destructive">Опасная зона</CardTitle>
                    <CardDescription>Необратимые действия</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Выйти из аккаунта</p>
                    <p className="text-sm text-muted-foreground">
                      Завершить текущую сессию
                    </p>
                  </div>
                  <Button variant="outline" onClick={logout}>
                    Выйти
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Удалить аккаунт</p>
                    <p className="text-sm text-muted-foreground">
                      Все данные будут удалены безвозвратно
                    </p>
                  </div>
                  <Button variant="destructive">Удалить</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
