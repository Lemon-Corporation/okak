"use client"

import { Mic, Search, Settings, Command, X, Maximize2, MessageSquare, Plus, FileText } from "lucide-react"

export function OverlayDemo() {
  return (
    <section className="bg-white py-24 relative overflow-hidden border-t border-gray-100">
      {/* Abstract background lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0038FF]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-[#0038FF]/10 text-[#0038FF] font-bold text-sm px-4 py-2 rounded-full mb-4">
            <Maximize2 className="w-4 h-4" />
            Оверлей для Windows
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-gray-900 mb-6">
            Всегда поверх <span className="text-[#0038FF]">ваших окон</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            OKAK работает как прозрачный слой над вашими приложениями. Нажмите <kbd className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm mx-1 font-mono border border-gray-200">Alt + Space</kbd>, скажите команду — и продолжайте работу. Не нужно переключать окна.
          </p>
        </div>

        {/* Windows Desktop Mockup */}
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 aspect-video bg-[#1e1e24]">
            
            {/* Fake Windows Background (Browser/Code Editor mockup) */}
            <div className="absolute inset-0 flex flex-col opacity-40 grayscale">
              {/* Fake App Window */}
              <div className="flex-1 m-8 rounded-xl bg-white shadow-xl flex flex-col overflow-hidden">
                <div className="h-10 bg-gray-100 border-b flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="mx-auto bg-white rounded-md w-1/2 h-6 border" />
                </div>
                <div className="flex-1 p-8">
                  <div className="w-3/4 h-8 bg-gray-200 rounded mb-6" />
                  <div className="space-y-4">
                    <div className="w-full h-4 bg-gray-100 rounded" />
                    <div className="w-5/6 h-4 bg-gray-100 rounded" />
                    <div className="w-full h-4 bg-gray-100 rounded" />
                    <div className="w-2/3 h-4 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* OKAK OVERLAY (The actual feature) */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]">
              
              {/* Voice Command Widget (Top Corner) */}
              <div className="absolute top-8 right-8 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 z-30">
                {/* Transcribed Text Bubble */}
                <div className="bg-[#111111]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl px-6 py-4 max-w-sm flex flex-col items-end">
                  <p className="text-white/90 text-lg font-medium leading-snug text-right">
                    "Сохрани этот абзац и отправь в идеи..."
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-white/50">Слушаю</span>
                    <div className="flex gap-1">
                      <span className="w-1 h-1 bg-[#BFFF00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 bg-[#BFFF00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 bg-[#BFFF00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>

                {/* Voice activity sphere - miniature version from Hero */}
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  {/* Outer glow */}
                  <div className="absolute inset-0 rounded-full bg-[#0038FF]/40 blur-xl animate-sphere-glow" />
                  
                  {/* Main sphere */}
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-[#0038FF]/60 to-[#0038FF]/80 animate-sphere-morph">
                      <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-white/60 via-[#BFFF00]/50 to-[#0038FF]/50 animate-sphere-inner" />
                      <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/80 to-[#BFFF00]/60 animate-sphere-core" />
                      <div className="absolute inset-4 rounded-full bg-white/80 animate-sphere-pulse" />
                    </div>
                  </div>
                  
                  {/* Voice icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-[#0038FF]" />
                  </div>
                </div>
              </div>

              {/* Central Command Input (Optional) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl opacity-50 pointer-events-none">
                <div className="bg-[#111111]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#0038FF] flex items-center justify-center shrink-0">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <input 
                    type="text" 
                    readOnly
                    placeholder="Или введи команду текстом..."
                    className="bg-transparent border-none text-white/50 text-xl font-medium w-full focus:outline-none"
                  />
                </div>
              </div>

              {/* Floating Action Button (Corner Widget) */}
              <div className="absolute bottom-8 right-8 flex flex-col items-end gap-4">
                {/* Mini notification */}
                <div className="bg-[#111111]/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl flex items-center gap-3 max-w-xs animate-in slide-in-from-right-8 fade-in duration-500 delay-300">
                  <div className="w-2 h-2 rounded-full bg-[#BFFF00]" />
                  <p className="text-sm text-white/90">Текст скопирован и добавлен в "Идеи"</p>
                  <button className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
              </div>

            </div>

            {/* Windows Taskbar (Mock) */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#111111] border-t border-white/5 flex items-center justify-center gap-2 px-4 z-20">
              <div className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center transition-colors">
                <svg viewBox="0 0 87.6 87.6" className="w-5 h-5 fill-[#00a4ef]"><path d="M0 12.4l35.7-4.9v34.2H0V12.4zm35.7 33.3v34.2l-35.7-4.9V45.7h35.7zm4.2-34l47.7-6.8v36.6H39.9V11.7zm47.7 38.2v36.6l-47.7-6.8V49.9h47.7z"/></svg>
              </div>
              <div className="w-px h-6 bg-white/10 mx-2" />
              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/80 rounded-sm" />
              </div>
              <div className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white/80" />
              </div>
              {/* OKAK Tray Icon */}
              <div className="absolute right-4 flex items-center gap-3">
                <div className="flex items-center gap-2 px-2 hover:bg-white/10 rounded cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-[#BFFF00] animate-pulse" />
                  <span className="text-white/80 font-bold text-xs">OKAK</span>
                </div>
                <div className="text-white/50 text-xs">12:00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Bot(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}
