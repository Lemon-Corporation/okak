"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, FileText, Brain, Link2, CheckCircle, Bell, Mic, MessageCircle } from "lucide-react"

export function Hero() {
  return (
    <section className="relative h-screen bg-[#0038FF] overflow-hidden flex items-center">
      {/* Background blurs */}
      <div className="absolute top-20 right-[15%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-[10%] w-48 h-48 bg-[#BFFF00]/10 rounded-full blur-2xl" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#BFFF00]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      
      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left - Text */}
          <div>
            <h1 className="font-display text-[clamp(2.5rem,8vw,6rem)] font-bold text-white leading-[1.1] tracking-tight mb-6">
              <span className="text-[#BFFF00]">#</span>AI
              <br />
              <span className="relative inline-block">
                АГЕНТ
                <svg className="absolute -bottom-1 left-0 w-full h-3" viewBox="0 0 300 20" preserveAspectRatio="none">
                  <path d="M0,15 Q150,0 300,15" stroke="#BFFF00" strokeWidth="4" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
              <br />
              <span className="text-white/90">ДЛЯ ТВОИХ</span>
              <br />
              <span className="text-white/90">ДАННЫХ</span>
            </h1>

            <p className="text-white/80 text-xl lg:text-2xl mb-8 leading-relaxed max-w-lg">
              Твой личный Джарвис. Скажи, что нужно найти, перенести или структурировать — <span className="text-[#BFFF00] font-semibold">OKAK сделает это за тебя</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button 
                size="lg" 
                className="bg-[#BFFF00] hover:bg-[#d4ff4d] text-[#0038FF] font-bold text-lg px-8 h-14 rounded-full group"
              >
                Начать бесплатно
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white font-medium text-lg px-8 h-14 rounded-full"
              >
                Смотреть демо
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-full">#голосовой_ввод</span>
              <span className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-full">#ai_агент</span>
              <span className="text-xs text-white/50 bg-white/10 px-3 py-1 rounded-full">#простой</span>
            </div>
          </div>

          {/* Right - Voice sphere with cards */}
          <div className="relative hidden lg:flex items-center justify-center h-[500px] w-[600px]">
            {/* SVG connections layer - sphere to cards + card to card connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* Lines from center sphere to cards */}
              <line x1="50%" y1="50%" x2="50%" y2="15%" stroke="#BFFF00" strokeWidth="1.5" strokeDasharray="4 4" className="animate-line-wave" />
              <line x1="50%" y1="50%" x2="75%" y2="22%" stroke="#BFFF00" strokeWidth="1.5" strokeDasharray="4 4" className="animate-line-wave" style={{ animationDelay: '0.15s' }} />
              <line x1="50%" y1="50%" x2="88%" y2="50%" stroke="#BFFF00" strokeWidth="1.5" strokeDasharray="4 4" className="animate-line-wave" style={{ animationDelay: '0.3s' }} />
              <line x1="50%" y1="50%" x2="73%" y2="78%" stroke="#BFFF00" strokeWidth="1.5" strokeDasharray="4 4" className="animate-line-wave" style={{ animationDelay: '0.45s' }} />
              <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="#BFFF00" strokeWidth="1.5" strokeDasharray="4 4" className="animate-line-wave" style={{ animationDelay: '0.6s' }} />
              <line x1="50%" y1="50%" x2="27%" y2="78%" stroke="#BFFF00" strokeWidth="1.5" strokeDasharray="4 4" className="animate-line-wave" style={{ animationDelay: '0.75s' }} />
              <line x1="50%" y1="50%" x2="12%" y2="50%" stroke="#BFFF00" strokeWidth="1.5" strokeDasharray="4 4" className="animate-line-wave" style={{ animationDelay: '0.9s' }} />
              <line x1="50%" y1="50%" x2="25%" y2="22%" stroke="#BFFF00" strokeWidth="1.5" strokeDasharray="4 4" className="animate-line-wave" style={{ animationDelay: '1.05s' }} />
              
              {/* Connections between cards - AI network */}
              {/* Сказал → AI запомнил */}
              <path d="M50% 15% Q60% 18% 75% 22%" stroke="#BFFF00/50" strokeWidth="1" strokeDasharray="3 3" fill="none" className="animate-line-wave" style={{ animationDelay: '0.4s' }} />
              {/* AI запомнил → Связал */}
              <path d="M75% 22% Q82% 35% 88% 50%" stroke="#BFFF00/50" strokeWidth="1" strokeDasharray="3 3" fill="none" className="animate-line-wave" style={{ animationDelay: '0.5s' }} />
              {/* Связал → Записал */}
              <path d="M88% 50% Q80% 65% 73% 78%" stroke="#BFFF00/50" strokeWidth="1" strokeDasharray="3 3" fill="none" className="animate-line-wave" style={{ animationDelay: '0.6s' }} />
              {/* Записал → Под контролем */}
              <path d="M73% 78% Q62% 82% 50% 85%" stroke="#BFFF00/50" strokeWidth="1" strokeDasharray="3 3" fill="none" className="animate-line-wave" style={{ animationDelay: '0.7s' }} />
              {/* Под контролем → Связи */}
              <path d="M50% 85% Q38% 82% 27% 78%" stroke="#BFFF00/50" strokeWidth="1" strokeDasharray="3 3" fill="none" className="animate-line-wave" style={{ animationDelay: '0.8s' }} />
              {/* Связи → Спросил */}
              <path d="M27% 78% Q18% 65% 12% 50%" stroke="#BFFF00/50" strokeWidth="1" strokeDasharray="3 3" fill="none" className="animate-line-wave" style={{ animationDelay: '0.9s' }} />
              {/* Спросил → Напомнил */}
              <path d="M12% 50% Q18% 35% 25% 22%" stroke="#BFFF00/50" strokeWidth="1" strokeDasharray="3 3" fill="none" className="animate-line-wave" style={{ animationDelay: '1.0s' }} />
              {/* Напомнил → Сказал */}
              <path d="M25% 22% Q38% 18% 50% 15%" stroke="#BFFF00/50" strokeWidth="1" strokeDasharray="3 3" fill="none" className="animate-line-wave" style={{ animationDelay: '1.1s' }} />
              
              {/* Cross connections - creative links */}
              {/* Сказал → Связи (voice connects ideas) */}
              <path d="M50% 15% Q30% 50% 27% 78%" stroke="#0038FF/40" strokeWidth="1" strokeDasharray="2 4" fill="none" className="animate-line-wave" style={{ animationDelay: '0.2s' }} />
              {/* AI запомнил → Под контролем */}
              <path d="M75% 22% Q60% 55% 50% 85%" stroke="#0038FF/40" strokeWidth="1" strokeDasharray="2 4" fill="none" className="animate-line-wave" style={{ animationDelay: '0.35s' }} />
              {/* Записал → Напомнил */}
              <path d="M73% 78% Q50% 50% 25% 22%" stroke="#0038FF/40" strokeWidth="1" strokeDasharray="2 4" fill="none" className="animate-line-wave" style={{ animationDelay: '0.55s' }} />
            </svg>

            {/* Voice activity sphere - like Siri/Alexa */}
            <div className="relative w-56 h-56 flex items-center justify-center z-10">
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-full bg-[#0038FF]/20 blur-2xl animate-sphere-glow" />
              
              {/* Main sphere */}
              <div className="relative w-full h-full">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-[#0038FF]/60 to-[#0038FF]/80 animate-sphere-morph">
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/60 via-[#BFFF00]/30 to-[#0038FF]/50 animate-sphere-inner" />
                  <div className="absolute inset-8 rounded-full bg-gradient-to-br from-white/80 to-[#BFFF00]/40 animate-sphere-core" />
                  <div className="absolute inset-12 rounded-full bg-white/60 animate-sphere-pulse" />
                </div>
              </div>
              
              {/* Voice icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Mic className="w-12 h-12 text-white/80" />
              </div>
            </div>

            {/* Cards positioned around sphere */}
            <div className="absolute top-[5%] left-1/2 -translate-x-1/2 z-20">
              <div className="bg-white/20 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-white/30 animate-card-move-1">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#BFFF00]" />
                  <span className="text-white text-sm font-medium">Сказал вслух</span>
                </div>
              </div>
            </div>

            <div className="absolute top-[18%] right-[8%] z-20">
              <div className="bg-white/20 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-white/30 animate-card-move-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#BFFF00]" />
                  <span className="text-white text-sm font-medium">AI запомнил</span>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 right-[2%] -translate-y-1/2 z-20">
              <div className="bg-[#BFFF00] rounded-xl px-4 py-2.5 animate-card-move-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0038FF]" />
                  <span className="text-[#0038FF] text-sm font-bold">Связал</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[18%] right-[12%] z-20">
              <div className="bg-white/20 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-white/30 animate-card-move-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#BFFF00]" />
                  <span className="text-white text-sm font-medium">Записал</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 z-20">
              <div className="bg-white/20 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-white/30 animate-card-move-5">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#BFFF00]" />
                  <span className="text-white text-sm font-medium">Под контролем</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[18%] left-[12%] z-20">
              <div className="bg-white/20 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-white/30 animate-card-move-6">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-[#BFFF00]" />
                  <span className="text-white text-sm font-medium">Связи</span>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 left-[2%] -translate-y-1/2 z-20">
              <div className="bg-white/20 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-white/30 animate-card-move-7">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#BFFF00]" />
                  <span className="text-white text-sm font-medium">Спросил</span>
                </div>
              </div>
            </div>

            <div className="absolute top-[18%] left-[8%] z-20">
              <div className="bg-white/20 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-white/30 animate-card-move-8">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#BFFF00]" />
                  <span className="text-white text-sm font-medium">Напомнил</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rotating badge */}
      <div className="absolute bottom-16 right-8 lg:right-16 hidden md:block">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#BFFF00]/50 animate-spin" style={{ animationDuration: '20s' }} />
          <div className="absolute inset-2 bg-[#BFFF00] rounded-full flex items-center justify-center">
            <span className="text-[#0038FF] font-bold text-[10px] text-center leading-tight px-2">
              НАЧНИ<br />БЕСПЛАТНО
            </span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
        <span className="text-xs">Листай вниз</span>
        <svg className="w-5 h-5 animate-bounce" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M5 11l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <style jsx>{`
        /* Voice sphere animations */
        @keyframes sphere-morph {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.03, 0.97); }
          50% { transform: scale(0.98, 1.02); }
          75% { transform: scale(1.02, 0.98); }
        }
        @keyframes sphere-inner {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes sphere-core {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes sphere-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }
        @keyframes sphere-glow {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 0.6; }
        }
        
        /* Line wave animation - pulse from center */
        @keyframes line-wave {
          0% { stroke-dashoffset: 20; opacity: 0.3; }
          50% { stroke-dashoffset: 0; opacity: 0.9; }
          100% { stroke-dashoffset: -20; opacity: 0.3; }
        }
        
        /* Card move animation - push out from center */
        @keyframes card-move-1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes card-move-2 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(3px) translateY(-2px); }
        }
        @keyframes card-move-3 {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        @keyframes card-move-4 {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px) translateY(3px); }
        }
        @keyframes card-move-5 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        @keyframes card-move-6 {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-3px) translateY(3px); }
        }
        @keyframes card-move-7 {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-4px); }
        }
        @keyframes card-move-8 {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-3px) translateY(-2px); }
        }
        
        .animate-sphere-morph { animation: sphere-morph 8s ease-in-out infinite; }
        .animate-sphere-inner { animation: sphere-inner 5s ease-in-out infinite; }
        .animate-sphere-core { animation: sphere-core 4s ease-in-out infinite; }
        .animate-sphere-pulse { animation: sphere-pulse 3s ease-in-out infinite; }
        .animate-sphere-glow { animation: sphere-glow 6s ease-in-out infinite; }
        .animate-line-wave { animation: line-wave 2.5s ease-in-out infinite; }
        
        .animate-card-move-1 { animation: card-move-1 3s ease-in-out infinite; }
        .animate-card-move-2 { animation: card-move-2 3.2s ease-in-out infinite; }
        .animate-card-move-3 { animation: card-move-3 2.8s ease-in-out infinite; }
        .animate-card-move-4 { animation: card-move-4 3.5s ease-in-out infinite; }
        .animate-card-move-5 { animation: card-move-5 3.1s ease-in-out infinite; }
        .animate-card-move-6 { animation: card-move-6 3.3s ease-in-out infinite; }
        .animate-card-move-7 { animation: card-move-7 2.9s ease-in-out infinite; }
        .animate-card-move-8 { animation: card-move-8 3.4s ease-in-out infinite; }
        
        svg line, svg path {
          stroke-linecap: round;
        }
      `}</style>
    </section>
  )
}