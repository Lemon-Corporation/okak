"use client"

import { useState } from "react"
import { Check, ChevronDown, Sparkles } from "lucide-react"

const plans = [
  {
    name: "Бесплатно",
    price: 0,
    period: "",
    desc: "Для знакомства",
    features: ["50 заметок", "Базовый AI", "Поиск по заметкам", "1 устройство"],
    cta: "Начать бесплатно",
    highlight: false,
  },
  {
    name: "Pro",
    price: 990,
    period: "/мес",
    desc: "Для продуктивных",
    features: [
      "Безлимитные заметки",
      "Продвинутый AI",
      "Семантический поиск",
      "Все устройства",
      "Синхронизация календаря",
      "Умные напоминания",
      "Приоритетная поддержка",
    ],
    cta: "Попробовать Pro",
    highlight: true,
    badge: "Популярный",
  },
  {
    name: "Команда",
    price: null,
    period: "",
    desc: "Для команд",
    features: [
      "Всё из Pro",
      "Общие пространства",
      "Админ-панель",
      "SSO/SAML",
      "Выделенная поддержка",
    ],
    cta: "Связаться",
    highlight: false,
  },
]

const faqs = [
  {
    q: "Что значит \"AI организует заметки\"?",
    a: "OKAK использует искусственный интеллект чтобы автоматически связывать ваши заметки, находить общие темы и структурировать информацию. Вам не нужно создавать папки или теги — всё происходит автоматически.",
  },
  {
    q: "Чем OKAK отличается от Notion или Apple Notes?",
    a: "В отличие от обычных заметочников, OKAK сам понимает что вы записали и связывает информацию. Вы можете спросить \"что я записывал про проект X?\" и получить всё релевантное.",
  },
  {
    q: "Мои данные в безопасности?",
    a: "Да, мы используем end-to-end шифрование. Ваши заметки видны только вам — даже мы не можем их прочитать.",
  },
  {
    q: "Есть ли мобильное приложение?",
    a: "Да, OKAK работает на iOS, Android, Web и как десктопное приложение. Все заметки синхронизируются мгновенно.",
  },
]

export function Pricing() {
  const [annual, setAnnual] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <section id="pricing" className="py-24 md:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display font-bold text-gray-900 text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
            Простые <span className="text-[#0038FF]">тарифы</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Начни бесплатно. Переходи на Pro когда нужно больше.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                !annual ? "bg-[#0038FF] text-white" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Месяц
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                annual ? "bg-[#0038FF] text-white" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Год 
              <span className={`text-xs px-2 py-0.5 rounded-full ${annual ? "bg-[#BFFF00] text-[#0038FF]" : "bg-[#BFFF00] text-[#0038FF]"}`}>
                -25%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 md:p-8 rounded-3xl transition-all ${
                plan.highlight 
                  ? "bg-[#0038FF] text-white scale-[1.02]" 
                  : "bg-white border border-gray-200"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-[#0038FF] bg-[#BFFF00] px-4 py-1.5 rounded-full flex items-center gap-1">
                  <Sparkles size={12} />
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <p className={`text-sm mb-1 ${plan.highlight ? "text-white/70" : "text-gray-500"}`}>
                  {plan.desc}
                </p>
                <p className={`font-display font-bold text-2xl ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </p>
              </div>

              <div className="mb-6">
                {plan.price !== null ? (
                  <p>
                    <span className={`font-display font-bold text-5xl ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                      {annual ? Math.round(plan.price * 0.75) : plan.price}
                    </span>
                    <span className={`text-lg ${plan.highlight ? "text-white/70" : "text-gray-500"}`}> ₽</span>
                    {plan.period && (
                      <span className={`text-sm ${plan.highlight ? "text-white/70" : "text-gray-500"}`}>{plan.period}</span>
                    )}
                  </p>
                ) : (
                  <p className={`font-display font-bold text-4xl ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                    По запросу
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-3 text-sm ${plan.highlight ? "text-white/90" : "text-gray-600"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? "bg-[#BFFF00]" : "bg-[#0038FF]/10"}`}>
                      <Check size={12} className={plan.highlight ? "text-[#0038FF]" : "text-[#0038FF]"} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`block text-center text-sm font-bold py-4 rounded-full transition-all ${
                  plan.highlight
                    ? "bg-[#BFFF00] text-[#0038FF] hover:bg-[#d4ff4d]"
                    : "bg-[#0038FF] text-white hover:bg-[#0030dd]"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
