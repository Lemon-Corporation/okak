"use client"

import { Bot, Plus, Search, Settings, Mic, LayoutDashboard, Database, Zap, Sparkles, Workflow, Command, History, CheckCircle2 } from "lucide-react"

export function AppNavigation() {
  return (
    <section className="bg-white py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-gray-900 mb-6">
            Ваш личный <span className="text-[#0038FF]">Дэшборд</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Всё под рукой: управляйте агентами, настраивайте no-code пайплайны и создавайте новые голосовые команды.
          </p>
        </div>

        <div className="bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden shadow-2xl shadow-gray-200/50">
          <div className="flex h-[600px]">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#0038FF] rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">Мой OKAK</span>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto space-y-6">
                {/* Main Menu */}
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 bg-gray-100 text-[#0038FF] rounded-lg font-medium text-sm transition-colors">
                    <LayoutDashboard className="w-4 h-4" />
                    Дэшборд
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors">
                    <History className="w-4 h-4" />
                    История диалогов
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors">
                    <Database className="w-4 h-4" />
                    Мои базы знаний
                  </button>
                </div>

                {/* Automation */}
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Автоматизация</div>
                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors">
                      <Workflow className="w-4 h-4" />
                      Пайплайны
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors">
                      <Command className="w-4 h-4" />
                      Голосовые команды
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors">
                      <Zap className="w-4 h-4" />
                      Интеграции
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors">
                  <Settings className="w-4 h-4" />
                  Настройки
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-gray-50/50">
              {/* Topbar */}
              <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative w-full max-w-md">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Поиск по базе, командам и пайплайнам..." 
                      className="w-full bg-gray-100 border-transparent rounded-full pl-10 pr-4 py-2 text-sm focus:bg-white focus:border-[#0038FF]/30 focus:ring-2 focus:ring-[#0038FF]/10 outline-none transition-all"
                    />
                  </div>
                </div>
                <button className="bg-[#BFFF00] text-[#0038FF] px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-[#d4ff4d] transition-colors">
                  <Plus className="w-4 h-4" />
                  Новый пайплайн
                </button>
              </div>

              {/* Dashboard Content */}
              <div className="p-8 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* Active Pipelines */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Workflow className="w-5 h-5 text-[#0038FF]" />
                        Активные пайплайны
                      </h3>
                      <button className="text-sm text-[#0038FF] font-medium hover:underline">Все</button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">Интервью → Задачи</div>
                            <div className="text-xs text-gray-500">Авто-расшифровка и создание тикетов</div>
                          </div>
                        </div>
                        <div className="w-10 h-6 bg-green-100 rounded-full flex items-center px-1 relative">
                          <div className="w-4 h-4 bg-green-500 rounded-full absolute right-1"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <Database className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">Скриншоты в базу</div>
                            <div className="text-xs text-gray-500">Распознавание текста с картинок</div>
                          </div>
                        </div>
                        <div className="w-10 h-6 bg-green-100 rounded-full flex items-center px-1 relative">
                          <div className="w-4 h-4 bg-green-500 rounded-full absolute right-1"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Voice Commands Editor Preview */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#BFFF00]/10 rounded-full blur-2xl" />
                    <div className="flex items-center justify-between mb-6 relative">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Command className="w-5 h-5 text-[#BFFF00]" />
                        Голосовые команды
                      </h3>
                      <button className="text-sm text-[#0038FF] font-medium hover:underline">Изменить</button>
                    </div>
                    <div className="space-y-3 relative">
                      <div className="border border-gray-100 rounded-xl p-3 bg-white">
                        <div className="text-xs text-gray-400 mb-1">Если я говорю:</div>
                        <div className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded flex items-center gap-2 mb-2">
                          <Mic className="w-3 h-3 text-[#0038FF]" />
                          "Сохрани это в идеи для блога"
                        </div>
                        <div className="text-xs text-gray-400 mb-1">Тогда:</div>
                        <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Добавить в таблицу "Блог", тег #идея
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Voice Interaction Mockup */}
                <div className="bg-[#0038FF] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#BFFF00]/20 rounded-full blur-3xl" />
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#BFFF00] rounded-full flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-[#BFFF00] rounded-full animate-ping opacity-20" />
                      <Mic className="w-5 h-5 text-[#0038FF]" />
                    </div>
                    <div>
                      <div className="text-[#BFFF00] text-sm font-bold mb-1">OKAK слушает...</div>
                      <div className="text-white/80 text-sm">"Перенеси все заметки с тегом #проект_Х в отдельную папку и сделай по ним саммари..."</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Features list below dashboard */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#0038FF]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Command className="w-6 h-6 text-[#0038FF]" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Свои команды</h4>
            <p className="text-sm text-gray-500">Обучи агента понимать твои специфические фразы и термины</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-[#0038FF]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Workflow className="w-6 h-6 text-[#0038FF]" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">No-code пайплайны</h4>
            <p className="text-sm text-gray-500">Настраивай автоматическую сортировку и обработку данных без кода</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-[#0038FF]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mic className="w-6 h-6 text-[#0038FF]" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Правки голосом</h4>
            <p className="text-sm text-gray-500">Редактируй структуру, меняй настройки и управляй коннектами прямо в диалоге</p>
          </div>
        </div>
      </div>
    </section>
  )
}