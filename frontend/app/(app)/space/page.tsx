'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import {
  ArrowUp,
  Sparkles,
  StickyNote,
  CheckSquare,
  FolderKanban,
  Search,
  Bot,
  User,
} from 'lucide-react'

type Role = 'user' | 'assistant'

interface Message {
  id: string
  role: Role
  text: string
}

const suggestions = [
  { icon: StickyNote, label: 'Создать заметку', prompt: 'Помоги создать структуру заметки для нового проекта' },
  { icon: CheckSquare, label: 'Задачи на сегодня', prompt: 'Составь список задач на продуктивный день' },
  { icon: FolderKanban, label: 'Организовать проект', prompt: 'Как лучше организовать рабочий проект в ОКАК?' },
  { icon: Search, label: 'Найти по смыслу', prompt: 'Покажи, как искать заметки по ключевым словам' },
]

const stubReplies: Record<string, string> = {
  default:
    'Привет! Я помогаю организовать работу в ОКАК — заметки, задачи, проекты и файлы. Спросите что-нибудь или выберите подсказку выше.',
}

function getReply(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('заметк'))
    return 'Хорошая идея! Зайдите в раздел «Заметки» или нажмите «Быстрое создание» в боковом меню. Можете добавить теги и привязать к проекту.'
  if (lower.includes('задач'))
    return 'Для задач откройте раздел «Задачи». Установите приоритет и срок — так ничего не потеряется. Хотите я покажу как создать задачу прямо сейчас?'
  if (lower.includes('проект'))
    return 'В разделе «Проекты» вы можете собрать задачи, заметки и файлы под одну крышу. Начните с цвета и описания — это поможет быстро ориентироваться.'
  if (lower.includes('поиск') || lower.includes('найти'))
    return 'Поиск работает по всему содержимому: заметкам, задачам и проектам одновременно. Нажмите ⌘K или воспользуйтесь строкой поиска в меню.'
  return 'Понял вас! Если нужно что-то конкретное — уточните, и я постараюсь помочь с организацией вашей работы в ОКАК.'
}

export default function ChatPage() {
  const user = useAppStore((state) => state.user)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)

    await new Promise((r) => setTimeout(r, 820))

    const reply = getReply(trimmed)
    const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', text: reply }
    setMessages((prev) => [...prev, assistantMsg])
    setLoading(false)
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-5">           
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-white">
          <Bot className="h-4 w-4" />
        </div>
        <span className="font-bold text-foreground">Ассистент ОКАК</span>
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-lime/20 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-lime shadow-[0_0_10px_oklch(0.85_0.25_130)]" />
          <span className="text-xs font-bold text-foreground">онлайн</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <AnimatePresence>
            {isEmpty ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center pt-16 text-center"
              >
                <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-blue text-white shadow-xl shadow-blue/25">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">
                  Привет, {user?.name?.split(' ')[0] || 'друг'}!
                </h2>
                <p className="mt-2 max-w-sm text-foreground/70">
                  Я ваш ассистент в ОКАК. Помогу с заметками, задачами и проектами.
                </p>

                <div className="mt-10 grid w-full gap-3 sm:grid-cols-2">
                  {suggestions.map((s) => {
                    const Icon = s.icon
                    return (
                      <button
                        key={s.label}
                        onClick={() => send(s.prompt)}
                        className="liquid-glass flex items-center gap-3 rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue/10"
                      >
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue/10">
                          <Icon className="h-4 w-4 text-blue" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{s.label}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{s.prompt}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-5">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
                        msg.role === 'assistant' ? 'bg-primary text-white' : 'bg-lime text-black'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-tr-sm'
                          : 'liquid-glass text-foreground rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="liquid-glass flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-3">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="h-2 w-2 rounded-full bg-blue"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-border px-4 pb-5 pt-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="liquid-glass flex items-end gap-3 rounded-2xl p-3">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                autoResize()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send(input)
                }
              }}
              placeholder="Спросите что-нибудь…"
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              style={{ maxHeight: 160 }}
            />
            <Button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="h-9 w-9 shrink-0 rounded-xl bg-blue p-0 text-white shadow-lg shadow-blue/25 hover:bg-blue-dark disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Enter — отправить · Shift+Enter — новая строка
          </p>
        </div>
      </div>
    </div>
  )
}
