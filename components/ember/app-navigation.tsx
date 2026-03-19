"use client"

import { FileText, Folder, Plus, Search, Settings, Star, Clock, Brain, File, Image, MessageCircle, ChevronRight, ChevronDown, MoreHorizontal, Hash, Link2, CheckCircle2 } from "lucide-react"

const navigationItems = [
  {
    icon: Star,
    label: "Избранное",
    color: "text-yellow-500"
  },
  {
    icon: Clock,
    label: "Недавнее",
    color: "text-gray-400"
  }
]

const pages = [
  {
    title: "Рабочие заметки",
    icon: Folder,
    iconColor: "text-blue-500",
    items: [
      { type: "note", title: "План проекта", icon: FileText, color: "text-gray-600" },
      { type: "note", title: "Встреча с командой", icon: FileText, color: "text-gray-600" },
      { type: "ai", title: "Анализ рынка", icon: Brain, color: "text-purple-500", badge: "AI" },
      { type: "file", title: "Договор.pdf", icon: File, color: "text-red-500" },
      { type: "file", title: "Скриншот.png", icon: Image, color: "text-purple-500" },
    ]
  },
  {
    title: "Идеи и вдохновение",
    icon: Folder,
    iconColor: "text-orange-500",
    items: [
      { type: "note", title: "Новый продукт", icon: FileText, color: "text-gray-600" },
      { type: "ai", title: "Рекламная кампания", icon: Brain, color: "text-purple-500", badge: "AI" },
      { type: "note", title: "Маркетинг", icon: FileText, color: "text-gray-600" },
    ]
  },
  {
    title: "Архив",
    icon: Folder,
    iconColor: "text-gray-400",
    items: []
  }
]

export function AppNavigation() {
  return (
    <section className="bg-gray-50 py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-[10%] w-64 h-64 bg-[#0038FF]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-[5%] w-48 h-48 bg-[#BFFF00]/10 rounded-full blur-2xl" />

      {/* Floating hashtags */}
      <div className="absolute top-8 right-[15%] hidden lg:block transform rotate-6">
        <span className="inline-flex items-center gap-1 bg-white text-gray-600 font-bold text-sm px-4 py-2 rounded-full">
          <Folder className="w-4 h-4" />
          #структура
        </span>
      </div>
      <div className="absolute top-16 left-[10%] hidden lg:block transform -rotate-12">
          <span className="inline-flex items-center gap-1 bg-[#0038FF]/10 text-[#0038FF] font-bold text-sm px-4 py-2 rounded-full">
            #структура
          </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-[#0038FF]/10 text-[#0038FF] font-bold text-sm px-4 py-2 rounded-full mb-4">
            <Hash className="w-4 h-4" />
            Навигация
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Всё на своём <span className="text-[#0038FF]">месте</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Страницы, папки, файлы и ответы ИИ — всё организовано в удобном дереве. Находи нужное мгновенно
          </p>
        </div>

        {/* Main demo - App interface */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex">
              {/* Sidebar */}
              <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Поиск..." 
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0038FF]"
                  />
                </div>

                {/* Quick access */}
                <div className="mb-4">
                  {navigationItems.map((item) => (
                    <button 
                      key={item.label}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100 text-left"
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200 my-3" />

                {/* Pages tree */}
                <div className="space-y-1">
                  {pages.map((page) => (
                    <div key={page.title}>
                      <button className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-gray-100 text-left group">
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                        <page.icon className={`w-4 h-4 ${page.iconColor}`} />
                        <span className="text-sm text-gray-700 flex-1">{page.title}</span>
                        <MoreHorizontal className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                      </button>
                      
                      {/* Page items */}
                      <div className="ml-6 mt-1 space-y-0.5">
                        {page.items.map((item, idx) => (
                          <button 
                            key={idx}
                            className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-gray-100 text-left group"
                          >
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                            <span className="text-sm text-gray-600 flex-1 truncate">{item.title}</span>
                            {item.badge && (
                              <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                                {item.badge}
                              </span>
                            )}
                            <MoreHorizontal className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add button */}
                <button className="flex items-center gap-2 w-full px-3 py-2 mt-4 rounded-lg hover:bg-gray-100 text-left">
                  <Plus className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Новая страница</span>
                </button>
              </div>

              {/* Main content area */}
              <div className="flex-1 p-6">
                {/* Page header */}
                <div className="flex items-center gap-2 mb-6">
                  <Folder className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-xl text-gray-900">Рабочие заметки</h3>
                </div>

                {/* Content cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* AI Response card */}
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 hover:border-purple-200 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-purple-500" />
                      <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">AI</span>
                      <span className="text-xs text-gray-400 ml-auto">2 часа назад</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-[#0038FF] transition-colors">Анализ рынка</h4>
                    <p className="text-sm text-gray-500 line-clamp-3">
                      Конкуренты используют похожие модели ценообразования. Рекомендую протестировать A/B тестирование...
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Link2 className="w-3 h-3" />
                        связан с 3 заметками
                      </span>
                    </div>
                  </div>

                  {/* Note card */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="text-xs text-gray-400 ml-auto">Вчера</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-[#0038FF] transition-colors">План проекта</h4>
                    <p className="text-sm text-gray-500 line-clamp-3">
                      1. Define MVP features<br/>
                      2. Create wireframes<br/>
                      3. Set up CI/CD pipeline<br/>
                      4. Plan marketing launch
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        #проект
                      </span>
                    </div>
                  </div>

                  {/* File card */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 mb-3">
                      <File className="w-5 h-5 text-red-500" />
                      <span className="text-xs text-gray-400 ml-auto">3 дня назад</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-[#0038FF] transition-colors">Договор.pdf</h4>
                    <p className="text-sm text-gray-500">
                      AI извлек: стороны, даты, условия
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        обработан
                      </span>
                    </div>
                  </div>

                  {/* Image card */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2 mb-3">
                      <Image className="w-5 h-5 text-purple-500" />
                      <span className="text-xs text-gray-400 ml-auto">Неделю назад</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-[#0038FF] transition-colors">Скриншот.png</h4>
                    <p className="text-sm text-gray-500">
                      AI: найдены элементы интерфейса
                    </p>
                  </div>
                </div>

                {/* Add new */}
                <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Добавить элемент</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features list */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#0038FF]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Folder className="w-6 h-6 text-[#0038FF]" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Страницы и папки</h4>
            <p className="text-sm text-gray-500">Создавай иерархию как в Notion</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-[#0038FF]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-[#0038FF]" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">AI ответы</h4>
            <p className="text-sm text-gray-500">Ответы ИИ — как страницы в дереве</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-[#0038FF]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-6 h-6 text-[#0038FF]" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Связи междуNotes</h4>
            <p className="text-sm text-gray-500">Ссылайся на связанные заметки</p>
          </div>
        </div>
      </div>
    </section>
  )
}