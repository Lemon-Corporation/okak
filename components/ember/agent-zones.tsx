"use client"

import { Shield, Settings, Mic2, Lock, Globe, Cpu, Layers, CheckCircle2, Bot, Zap, ArrowRight, Sparkles } from "lucide-react"

const agents = [
  {
    name: "Браузер",
    icon: Globe,
    color: "#3B82F6",
    abilities: ["Сохранять", "Искать", "Читать"],
    connections: 12,
  },
  {
    name: "Файлы", 
    icon: Layers,
    color: "#8B5CF6",
    abilities: ["Индексировать", "Структурировать", "Находить"],
    connections: 8,
  },
  {
    name: "Календарь",
    icon: Cpu,
    color: "#10B981",
    abilities: ["Планировать", "Напоминать", "Приглашать"],
    connections: 6,
  },
  {
    name: "Система",
    icon: Shield,
    color: "#F59E0B",
    abilities: ["Автоматизировать", "Запускать", "Триггерить"],
    connections: 15,
  }
]

export function AgentZones() {
  return (
    <section className="bg-[#0038FF] py-20 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#BFFF00]/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px]" />

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="w-8 h-[2px] bg-[#BFFF00]" />
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-[#BFFF00]" />
            <span className="text-white font-medium text-sm">Голосовое управление</span>
          </div>
          <div className="w-8 h-[2px] bg-[#BFFF00]" />
        </div>

        <h2 className="font-display font-bold text-3xl md:text-4xl text-white text-center mb-4">
          Агенты в каждой <span className="text-[#BFFF00]">зоне</span>
        </h2>
        <p className="text-white/50 text-center text-sm mb-12 max-w-md mx-auto">
          Настройте права и агенты сами возьмут рутину на себя
        </p>

        {/* Main visualization - Agents connected in a row */}
        <div className="relative max-w-5xl mx-auto mb-16">
          {/* Connection lines SVG - positioned behind cards */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 200" preserveAspectRatio="xMidYMid meet">
            {/* Main horizontal line */}
            <line x1="100" y1="100" x2="900" y2="100" stroke="#BFFF00" strokeWidth="2" opacity="0.3" />
            
            {/* Lines to each agent card */}
            <line x1="150" y1="100" x2="150" y2="50" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="400" y1="100" x2="400" y2="50" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="650" y1="100" x2="650" y2="50" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="900" y1="100" x2="900" y2="50" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" />

            {/* Connection dots */}
            <circle cx="150" cy="100" r="6" fill="#3B82F6" />
            <circle cx="400" cy="100" r="6" fill="#8B5CF6" />
            <circle cx="650" cy="100" r="6" fill="#10B981" />
            <circle cx="900" cy="100" r="6" fill="#F59E0B" />
          </svg>

          {/* Agent cards in a horizontal row */}
          <div className="flex justify-between items-start gap-4 pt-16">
            {agents.map((agent, i) => (
              <div 
                key={agent.name}
                className="relative flex-1 max-w-[220px]"
              >
                {/* Connection line going down */}
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full h-16 border-l-2 border-dashed"
                  style={{ borderColor: `${agent.color}50` }}
                />
                
                {/* Agent card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all group">
                  {/* Agent icon */}
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${agent.color}30` }}
                    >
                      <agent.icon className="w-5 h-5" style={{ color: agent.color }} />
                    </div>
                    <div>
                      <span className="text-white font-bold text-sm block">{agent.name}</span>
                      <span className="text-white/40 text-xs">{agent.connections} связей</span>
                    </div>
                  </div>

                  {/* Abilities */}
                  <div className="flex flex-wrap gap-1.5">
                    {agent.abilities.map((ability) => (
                      <span 
                        key={ability}
                        className="text-[10px] px-2 py-1 rounded-full text-white/70"
                        style={{ backgroundColor: `${agent.color}20` }}
                      >
                        {ability}
                      </span>
                    ))}
                  </div>

                  {/* Bottom line indicator */}
                  <div 
                    className="h-1 mt-3 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Center hub below */}
          <div className="flex justify-center mt-8">
            <div className="relative">
              {/* Connection lines to center */}
              <svg className="absolute inset-0 -translate-y-8 w-[600px] h-16 pointer-events-none" viewBox="0 0 600 60" preserveAspectRatio="xMidYMid meet" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                <line x1="50" y1="0" x2="50" y2="30" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="200" y1="0" x2="200" y2="30" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="350" y1="0" x2="350" y2="30" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="500" y1="0" x2="500" y2="30" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="50" y1="30" x2="500" y2="30" stroke="#BFFF00" strokeWidth="2" opacity="0.5" />
                <circle cx="50" cy="0" r="4" fill="#3B82F6" />
                <circle cx="200" cy="0" r="4" fill="#8B5CF6" />
                <circle cx="350" cy="0" r="4" fill="#10B981" />
                <circle cx="500" cy="0" r="4" fill="#F59E0B" />
              </svg>

              {/* Center hub */}
              <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg shadow-white/10">
                <Bot className="w-10 h-10 text-[#0038FF]" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#BFFF00] rounded-full flex items-center justify-center">
                  <Mic2 className="w-2 h-2 text-[#0038FF]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Voice command + Shortcuts */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Voice command */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Mic2 className="w-4 h-4 text-[#BFFF00]" />
              <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Голосовая команда</span>
            </div>
            <p className="text-white text-lg font-medium mb-3">
              "Запиши на завтра в 3"
            </p>
            <div className="flex items-center gap-2 text-[#BFFF00] text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Создано событие + напоминание</span>
            </div>
          </div>

          {/* Shortcuts */}
          <div className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-[#BFFF00]" />
              <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Горячие клавиши</span>
            </div>
            <div className="flex gap-2 mb-2">
              <kbd className="bg-white/10 px-2.5 py-1.5 rounded text-white/80 text-xs font-mono">Ctrl</kbd>
              <kbd className="bg-white/10 px-2.5 py-1.5 rounded text-white/80 text-xs font-mono">Shift</kbd>
              <kbd className="bg-white/10 px-2.5 py-1.5 rounded text-white/80 text-xs font-mono">O</kbd>
            </div>
            <p className="text-white/50 text-sm">Активировать OKAK</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-3 bg-[#BFFF00] text-[#0038FF] font-bold px-8 py-4 rounded-full hover:bg-[#d4ff4d] transition-all group">
            <Bot className="w-5 h-5" />
            Создать агента
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Security */}
        <div className="flex items-center justify-center gap-2 mt-6 text-white/30 text-xs">
          <Lock className="w-3 h-3" />
          <span>Изолированные зоны • Ваш контроль • Приватность</span>
        </div>
      </div>
    </section>
  )
}
