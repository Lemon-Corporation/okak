"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Bot, Sparkles, CheckCircle2 } from "lucide-react"

export default function JoinPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Here you would normally send the email to your API
      setSubmitted(true)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[#0038FF] -skew-y-6 origin-top-left -translate-y-32" />
      <div className="absolute top-20 right-[10%] w-96 h-96 bg-[#BFFF00]/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-white hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">На главную</span>
        </Link>
        
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="OKAK" className="w-8 h-8 brightness-0 invert" />
          <span className="text-white font-display font-bold text-xl tracking-tight">OKAK</span>
        </Link>
        <div className="w-24" /> {/* Spacer for centering */}
      </nav>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-gray-200/50 w-full max-w-md border border-gray-100">
          
          {submitted ? (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">
                Вы в списке!
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Спасибо за интерес. Мы пришлем приглашение на бета-тестирование на почту <span className="font-medium text-gray-900">{email}</span> в ближайшее время.
              </p>
              <Link 
                href="/"
                className="inline-flex items-center justify-center w-full bg-gray-100 text-gray-900 font-bold px-6 py-3.5 rounded-full hover:bg-gray-200 transition-colors"
              >
                Вернуться на сайт
              </Link>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center gap-2 bg-[#BFFF00]/20 text-[#0038FF] font-bold text-xs px-3 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Закрытый бета-тест
              </div>
              
              <h1 className="font-display font-bold text-3xl md:text-4xl text-gray-900 mb-4 leading-tight">
                Получите ранний доступ к OKAK
              </h1>
              
              <p className="text-gray-600 mb-8">
                Оставьте email, чтобы попасть в whitelist. Мы постепенно открываем доступ новым пользователям.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                    Ваш Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0038FF]/20 focus:border-[#0038FF] transition-all"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#0038FF] text-white font-bold px-6 py-4 rounded-2xl hover:bg-[#0030dd] transition-all group shadow-lg shadow-blue-500/25"
                >
                  <Bot className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Записаться на тест
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-gray-400">
                Оставляя почту, вы соглашаетесь получать новости о статусе продукта. Никакого спама.
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}