"use client"

import { Lightbulb, Rocket, Target, Sparkles, Mic, Brain, MessageCircle, Layers, Shield, Smartphone } from "lucide-react"

const useCases = [
  {
    icon: Rocket,
    title: "Предприниматели",
    desc: "Идеи, встречи, контакты — всё связано",
    hashtag: "#стартап"
  },
  {
    icon: Lightbulb,
    title: "Креативщики",
    desc: "Вдохновение никогда не потеряется",
    hashtag: "#идеи"
  },
  {
    icon: Target,
    title: "Студенты",
    desc: "Лекции, дедлайны, проекты — в одном месте",
    hashtag: "#учёба"
  }
]

const capabilities = [
  { icon: Mic, title: "Голосовой ввод", desc: "Скажи — OKAK запомнит" },
  { icon: Brain, title: "AI-агент", desc: "Думает и связывает" },
  { icon: MessageCircle, title: "Голосовые ответы", desc: "Спроси — ответит" },
  { icon: Layers, title: "Контекст проектов", desc: "Разные агенты для задач" },
  { icon: Shield, title: "Локально", desc: "Данные на твоём ПК" },
  { icon: Smartphone, title: "Синхронизация", desc: "С телефоном через Макс" }
]

export function Features() {
  return (
    <section className="bg-white">
      {/* Capabilities Grid */}
      <div className="py-24 bg-[#0038FF] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#BFFF00]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        
        <div className="max-w-7xl mx-auto px-6 w-full relative">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
              Голосовой <span className="text-[#BFFF00]">AI-помощник</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              OKAK объединяет все инструменты для работы с информацией в одном приложении
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap) => (
              <div 
                key={cap.title}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/20 transition-colors group"
              >
                <div className="w-14 h-14 rounded-xl bg-[#BFFF00] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <cap.icon className="w-7 h-7 text-[#0038FF]" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{cap.title}</h3>
                <p className="text-white/60">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-[#0038FF]/10 text-[#0038FF] font-bold text-sm px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              Для кого
            </span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-gray-900">
              <span className="text-[#0038FF]">OKAK</span> для всех
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase) => (
              <div 
                key={useCase.title}
                className="group bg-gray-50 rounded-3xl p-8 hover:bg-gray-100 transition-all relative"
              >
                <span className="absolute top-4 right-4 text-xs font-bold text-[#0038FF]/60 bg-[#0038FF]/5 px-3 py-1 rounded-full">
                  {useCase.hashtag}
                </span>
                 
                <div className="w-16 h-16 rounded-2xl bg-[#0038FF]/5 flex items-center justify-center mb-6 group-hover:bg-[#0038FF] transition-colors">
                  <useCase.icon className="w-8 h-8 text-[#0038FF] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-2xl text-gray-900 mb-3">{useCase.title}</h3>
                <p className="text-gray-500 text-lg">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}