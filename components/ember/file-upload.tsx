"use client"

import { Upload, FileText, Image as ImageIcon, CheckCircle2, Brain, Link2, Sparkles, ArrowRight, FileSpreadsheet } from "lucide-react"

const supportedFormats = [
  { icon: FileText, label: "PDF", bgLight: "bg-red-100", textLight: "text-red-600" },
  { icon: FileText, label: "DOCX", bgLight: "bg-blue-100", textLight: "text-blue-600" },
  { icon: ImageIcon, label: "IMG", bgLight: "bg-purple-100", textLight: "text-purple-600" },
  { icon: FileSpreadsheet, label: "XLSX", bgLight: "bg-green-100", textLight: "text-green-600" },
]

const fileProcessingSteps = [
  {
    title: "Бросай файл",
    desc: "Перетащи документ в окно или нажми для выбора",
    icon: Upload,
    hashtag: "#удобно"
  },
  {
    title: "AI анализирует",
    desc: "Нейронка читает содержимое, извлекает ключи и связи",
    icon: Brain,
    hashtag: "#умно"
  },
  {
    title: "Связывает с заметками",
    desc: "Находит релевантные записи и добавляет контекст",
    icon: Link2,
    hashtag: "#связи"
  },
  {
    title: "Используй в ответах",
    desc: "Спрашивай о файле — AI учтёт его в ответе",
    icon: Sparkles,
    hashtag: "#интеграция"
  }
]

export function FileUpload() {
  return (
    <section className="bg-white py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-[5%] w-64 h-64 bg-[#BFFF00]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-[10%] w-48 h-48 bg-[#0038FF]/10 rounded-full blur-2xl" />

      {/* Floating hashtags */}
      <div className="absolute top-8 left-[8%] hidden lg:block transform rotate-6 animate-bounce" style={{ animationDuration: '5s' }}>
        <span className="inline-flex items-center gap-1 bg-[#0038FF]/10 text-[#0038FF] font-bold text-sm px-4 py-2 rounded-full">
          <Upload className="w-4 h-4" />
          #файлы
        </span>
      </div>
      <div className="absolute top-16 right-[12%] hidden lg:block transform -rotate-12 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
        <span className="inline-flex items-center gap-1 bg-[#BFFF00] text-[#0038FF] font-bold text-sm px-4 py-2 rounded-full">
          #ai_анализ
        </span>
      </div>
      <div className="absolute bottom-12 left-[15%] hidden lg:block transform rotate-3">
        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 font-bold text-xs px-3 py-1.5 rounded-full">
          #без_ограничений
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-[#0038FF]/10 text-[#0038FF] font-bold text-sm px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            Загрузка файлов
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-gray-900 mb-4">
            Загружай файлы — <span className="text-[#0038FF]">AI сам</span> их обработает
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Скидывай документы, презентации, картинки прямо в приложение. Нейронка проанализирует содержимое и будет использовать в ответах
          </p>
        </div>

        <div className="mb-16 relative">
          {/* Animated dragging files - flying into drop zone */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {/* File 1 - PDF with preview */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-drag-1">
              <div className="w-28 bg-white rounded-xl overflow-hidden">
                <div className="bg-red-500 px-3 py-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">report.pdf</span>
                </div>
                <div className="h-16 bg-gray-50 flex items-center justify-center">
                  <div className="w-8 h-10 bg-red-100 rounded border-2 border-red-200 flex items-center justify-center">
                    <span className="text-red-500 text-xs font-bold">PDF</span>
                  </div>
                </div>
              </div>
            </div>
            {/* File 2 - DOCX with icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-drag-2">
              <div className="w-28 bg-white rounded-xl overflow-hidden">
                <div className="bg-blue-600 px-3 py-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">contract.docx</span>
                </div>
                <div className="h-16 bg-gray-50 flex items-center justify-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg font-bold">W</span>
                  </div>
                </div>
              </div>
            </div>
            {/* File 3 - Image with sun preview */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-drag-3">
              <div className="w-28 bg-white rounded-xl overflow-hidden">
                <div className="bg-purple-500 px-3 py-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">photo.png</span>
                </div>
                <div className="h-16 bg-gradient-to-br from-purple-300 via-purple-200 to-purple-400 flex items-center justify-center">
                  <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center">
                    <span className="text-orange-500 text-lg">☀️</span>
                  </div>
                </div>
              </div>
            </div>
            {/* File 4 - Excel with chart icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-drag-4">
              <div className="w-28 bg-white rounded-xl overflow-hidden">
                <div className="bg-green-600 px-3 py-2 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-medium">data.xlsx</span>
                </div>
                <div className="h-16 bg-gray-50 flex items-center justify-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg p-1 flex flex-col gap-0.5">
                    <div className="flex-1 bg-green-400 rounded-sm" />
                    <div className="flex-1 bg-green-300 rounded-sm" />
                    <div className="flex-1 bg-green-200 rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative max-w-3xl mx-auto">
            {/* Drop zone */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center hover:border-[#0038FF]/50 hover:bg-[#0038FF]/5 transition-all group cursor-pointer relative">
              {/* Success animation overlay */}
              <div className="absolute inset-0 bg-[#0038FF]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Animated icon */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-[#0038FF]/10 rounded-full animate-ping" />
                <div className="relative w-24 h-24 bg-[#0038FF] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h3 className="font-bold text-2xl text-gray-900 mb-2">
                Перетащи файлы сюда
              </h3>
              <p className="text-gray-500 mb-6">
                или нажми для выбора файлов
              </p>
              
              {/* Supported formats inline */}
              <div className="flex flex-wrap justify-center gap-2">
                {supportedFormats.map((format, idx) => (
                  <span 
                    key={format.label}
                    className={`inline-flex items-center gap-1.5 ${format.bgLight} ${format.textLight} px-3 py-1.5 rounded-full text-xs font-medium`}
                  >
                    <format.icon className="w-3.5 h-3.5" />
                    {format.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Corner decorations */}
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#BFFF00] rounded-lg rotate-12" />
            <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-[#0038FF] rounded-lg -rotate-12" />
          </div>
        </div>

        <style jsx>{`
          @keyframes flyInto {
            0% { 
              opacity: 0; 
              transform: translateX(-250px) scale(0.4) rotate(-35deg);
              filter: blur(8px);
            }
            15% {
              opacity: 1;
              transform: translateX(-100px) scale(1.1) rotate(-18deg);
              filter: blur(0);
            }
            40% {
              transform: translateX(0) scale(1.05) rotate(4deg);
            }
            60% {
              transform: translateX(0) scale(0.98) rotate(-2deg);
            }
            80% {
              opacity: 1;
              transform: translateX(0) scale(1) rotate(0deg);
            }
            95% {
              opacity: 0;
              transform: translateX(0) scale(0.3);
            }
            100% { 
              opacity: 0; 
              transform: translateX(0) scale(0);
            }
          }
          @keyframes flyIntoRight {
            0% { 
              opacity: 0; 
              transform: translateX(250px) scale(0.4) rotate(35deg);
              filter: blur(8px);
            }
            15% {
              opacity: 1;
              transform: translateX(100px) scale(1.1) rotate(18deg);
              filter: blur(0);
            }
            40% {
              transform: translateX(0) scale(1.05) rotate(-4deg);
            }
            60% {
              transform: translateX(0) scale(0.98) rotate(2deg);
            }
            80% {
              opacity: 1;
              transform: translateX(0) scale(1) rotate(0deg);
            }
            95% {
              opacity: 0;
              transform: translateX(0) scale(0.3);
            }
            100% { 
              opacity: 0; 
              transform: translateX(0) scale(0);
            }
          }
          .animate-drag-1 { animation: flyInto 4.5s ease-in-out infinite; }
          .animate-drag-2 { animation: flyIntoRight 4.5s ease-in-out infinite; animation-delay: 1.1s; }
          .animate-drag-3 { animation: flyInto 4.5s ease-in-out infinite; animation-delay: 2.2s; }
          .animate-drag-4 { animation: flyIntoRight 4.5s ease-in-out infinite; animation-delay: 3.3s; }
        `}</style>

        {/* Processing flow */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <span className="text-gray-500 text-sm">Как это работает</span>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {fileProcessingSteps.map((step, idx) => (
              <div key={step.title} className="relative">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-[#0038FF]/30 transition-colors text-center relative h-full">
                  {/* Step number */}
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-[#0038FF] text-white font-bold rounded-full flex items-center justify-center text-sm">
                    {idx + 1}
                  </span>
                  
                  {/* Hashtag */}
                  <span className="absolute -top-2 right-3 text-[10px] font-bold text-[#BFFF00] bg-[#0038FF]/5 px-2 py-0.5 rounded-full">
                    {step.hashtag}
                  </span>
                  
                  <div className="w-14 h-14 rounded-xl bg-[#0038FF]/10 flex items-center justify-center mx-auto mb-4 mt-2">
                    <step.icon className="w-7 h-7 text-[#0038FF]" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-gray-500 text-sm">{step.desc}</p>
                </div>
                
                {/* Arrow */}
                {idx < fileProcessingSteps.length - 1 && (
                  <svg className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-[#BFFF00] hidden md:block" viewBox="0 0 32 32" fill="none">
                    <path d="M4,16 L28,16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    <path d="M20,8 L28,16 L20,24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Visual example of file processing */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Example of file in app */}
            <div className="relative">
              <span className="absolute -top-2 -right-2 bg-[#BFFF00] text-[#0038FF] font-bold text-xs px-3 py-1 rounded-full transform rotate-12">
                пример
              </span>
              
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                {/* Mini file cards */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">Договор_аренды.pdf</p>
                      <p className="text-xs text-gray-400">AI: извлечены даты, условия, стороны</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">Скриншот__UI.png</p>
                      <p className="text-xs text-gray-400">AI: найдены элементы интерфейса</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">Отчёт_продажи.xlsx</p>
                      <p className="text-xs text-gray-400">AI: данные таблиц структурированы</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#0038FF] rounded-xl -z-10 opacity-20" />
            </div>
            
            {/* Right - AI interaction */}
            <div>
              <h3 className="font-display font-bold text-2xl text-gray-900 mb-4">
                Спрашивай — <span className="text-[#0038FF]">AI использует</span> файлы
              </h3>
              
              <div className="space-y-4">
                <div className="bg-[#0038FF] rounded-2xl p-5 text-white">
                  <p className="text-sm text-white/70 mb-2">Ты спрашиваешь</p>
                  <p className="font-medium">Когда истекает договор аренды?</p>
                </div>
                
                <div className="bg-gray-100 rounded-2xl p-5">
                  <p className="text-sm text-gray-500 mb-2">AI отвечает с учётом файла</p>
                  <p className="text-gray-900">
                    Договор аренды от <span className="text-[#0038FF] font-bold">15 марта 2024</span> 
                    действует до <span className="text-[#0038FF] font-bold">15 марта 2025</span>. 
                    Осталось <span className="text-[#BFFF00] font-bold bg-[#0038FF] px-1 rounded">347 дней</span>.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Файл автоматически связан с заметками</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a 
            href="#" 
            className="inline-flex items-center gap-2 bg-[#0038FF] text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-[#0030dd] transition-colors group"
          >
            Попробовать с файлами
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  )
}