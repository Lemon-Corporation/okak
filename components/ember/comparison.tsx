"use client"

import { CheckCircle2, XCircle } from "lucide-react"

export function Comparison() {
  return (
    <section className="bg-gray-50 py-24 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Чем OKAK отличается от других?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Мы не делаем очередную "базу знаний". OKAK — это ваш личный Джарвис, 
            который автоматизирует рутину через no-code пайплайны и коннекты к вашим данным.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Apple Notes */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 opacity-60">
            <h3 className="font-display font-bold text-2xl text-gray-900 mb-6">Apple Notes / Заметки</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-500">
                <CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <span>Просто и быстро открыть</span>
              </li>
              <li className="flex items-start gap-3 text-gray-500">
                <XCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
                <span>Нет AI для структурирования</span>
              </li>
              <li className="flex items-start gap-3 text-gray-500">
                <XCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
                <span>Информация лежит "мертвым грузом"</span>
              </li>
              <li className="flex items-start gap-3 text-gray-500">
                <XCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
                <span>Нет интеграций с другими сервисами</span>
              </li>
            </ul>
          </div>

          {/* OKAK */}
          <div className="bg-[#0038FF] rounded-3xl p-8 shadow-xl shadow-blue-500/20 relative transform lg:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#BFFF00] text-[#0038FF] font-bold text-sm px-4 py-1 rounded-full whitespace-nowrap">
              Ваш личный агент
            </div>
            <h3 className="font-display font-bold text-2xl text-white mb-6">OKAK</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white">
                <CheckCircle2 className="w-5 h-5 text-[#BFFF00] shrink-0 mt-0.5" />
                <span><strong>No-code пайплайны:</strong> настрой автоматизацию как тебе нужно</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <CheckCircle2 className="w-5 h-5 text-[#BFFF00] shrink-0 mt-0.5" />
                <span><strong>Коннекты:</strong> подключай свои базы, API и файлы</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <CheckCircle2 className="w-5 h-5 text-[#BFFF00] shrink-0 mt-0.5" />
                <span>Голосовое управление как у "Джарвиса"</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <CheckCircle2 className="w-5 h-5 text-[#BFFF00] shrink-0 mt-0.5" />
                <span>Сам структурирует и связывает информацию</span>
              </li>
            </ul>
          </div>

          {/* Notion */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 opacity-60">
            <h3 className="font-display font-bold text-2xl text-gray-900 mb-6">Notion / Obsidian</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-500">
                <CheckCircle2 className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <span>Мощные базы данных</span>
              </li>
              <li className="flex items-start gap-3 text-gray-500">
                <XCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
                <span>Перегруженный интерфейс</span>
              </li>
              <li className="flex items-start gap-3 text-gray-500">
                <XCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
                <span>Сложно быстро записать мысль на ходу</span>
              </li>
              <li className="flex items-start gap-3 text-gray-500">
                <XCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
                <span>AI работает как чат-бот, а не как агент-помощник</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
