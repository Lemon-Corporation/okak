"use client"

import { Zap, MessageSquare, Bot, CheckCircle2, Calendar, FileText, Send } from "lucide-react"

export function WhatIsOkak() {
  return (
    <section className="bg-gray-50 py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Description */}
          <div className="relative">
            <span className="absolute -top-2 -left-2 bg-[#FF3366] text-white font-bold text-xs px-3 py-1 rounded-full transform -rotate-12 z-10">
              NEW
            </span>
            
            <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6 leading-tight">
              Что такое <span className="text-[#0038FF] relative">
                OKAK
                <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8" stroke="#BFFF00" strokeWidth="4" fill="none" strokeLinecap="round"/>
                </svg>
              </span>?
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              OKAK — это <strong>голосовой AI-агент</strong>, который работает на твоём компьютере. 
              Слушает, запоминает, связывает. А ты решаешь — принимать предложения или сделать по-своему.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Хочешь — скажи голосом. Хочешь — запиши вручную. Всё под твоим контролем, просто быстрее.
            </p>
            
            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 bg-[#BFFF00] px-4 py-2 rounded-full text-sm text-[#0038FF] font-medium">
                Бесплатный план
              </span>
              <span className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-600">
                Без карты
              </span>
              <span className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-600">
                Приватность
              </span>
            </div>
          </div>
          
          {/* Right - Agent actions infographic */}
          <div className="relative">
            <div className="bg-[#0038FF] rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#BFFF00]/10 rounded-full blur-2xl" />
              
              <div className="flex items-center gap-3 mb-6 relative">
                <Bot className="w-8 h-8 text-[#BFFF00]" />
                <span className="font-display font-bold text-2xl">Что делают агенты</span>
              </div>

              {/* Agent commands examples */}
              <div className="space-y-3">
                {/* Command 1 */}
                <div className="bg-white/10 backdrop-blur rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#BFFF00] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-[#0038FF]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">"Добавь встречу с Антоном завтра в 3"</p>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span>Создал событие в календаре</span>
                    </div>
                  </div>
                </div>

                {/* Command 2 */}
                <div className="bg-white/10 backdrop-blur rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">"Сохрани ссылку на статью"</p>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span>Создал заметку с тегами</span>
                    </div>
                  </div>
                </div>

                {/* Command 3 */}
                <div className="bg-white/10 backdrop-blur rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">"Что я говорил про проект X?"</p>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span>Нашёл и ответил голосом</span>
                    </div>
                  </div>
                </div>

                {/* Command 4 */}
                <div className="bg-white/10 backdrop-blur rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Send className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">"Напомни про отчёт вечером"</p>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span>Установил напоминание</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#BFFF00] rounded-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}