'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'
import { authApi } from '@/lib/api'
import { User, CreditCard, Bell, Shield, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const user = useAppStore((state) => state.user)
  const logout = useAppStore((state) => state.logout)
  const updateUser = useAppStore((state) => state.updateUser)
  const [name, setName] = useState(user?.name || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

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
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input defaultValue={user?.email || ''} type="email" disabled />
                  <p className="text-xs text-muted-foreground">
                    Email нельзя изменить
                  </p>
                </div>
                {profileError && (
                  <p className="text-sm text-destructive">{profileError}</p>
                )}
                <div className="flex justify-end">
                  <Button
                    disabled={savingProfile || name === user?.name}
                    onClick={async () => {
                      setSavingProfile(true)
                      setProfileError('')
                      try {
                        await authApi.updateMe({ display_name: name })
                        updateUser({ name })
                      } catch {
                        setProfileError('Не удалось сохранить профиль')
                      } finally {
                        setSavingProfile(false)
                      }
                    }}
                  >
                    {savingProfile ? 'Сохранение...' : 'Сохранить'}
                  </Button>
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
                  <Input type="password" placeholder="********" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Новый пароль</label>
                  <Input type="password" placeholder="Минимум 6 символов" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
                <div className="flex justify-end">
                  <Button
                    disabled={!currentPassword || !newPassword || savingPassword}
                    onClick={async () => {
                      setSavingPassword(true)
                      setPasswordError('')
                      try {
                        await authApi.updateMe({ password: newPassword })
                        setCurrentPassword('')
                        setNewPassword('')
                      } catch {
                        setPasswordError('Не удалось изменить пароль')
                      } finally {
                        setSavingPassword(false)
                      }
                    }}
                  >
                    {savingPassword ? 'Сохранение...' : 'Изменить пароль'}
                  </Button>
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
