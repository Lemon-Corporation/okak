import Link from "next/link"
import { ArrowRight } from "lucide-react"

const cols = [
  {
    heading: "Продукт",
    links: ["Возможности", "Тарифы", "Скачать", "Что нового"],
  },
  {
    heading: "Ресурсы",
    links: ["Гайд", "Блог", "Сообщество", "Помощь"],
  },
  {
    heading: "Компания",
    links: ["О нас", "Карьера", "Контакты"],
  },
]

export function Footer() {
  return (
    <footer className="bg-[#0038FF]">
      {/* CTA band */}
      <div className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="font-display font-bold text-white text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[0.95] tracking-tight">
            Освободи голову.
            <br />
            <span className="text-[#BFFF00]">Начни сегодня.</span>
          </h2>
          <p className="mt-6 text-lg text-white/70">
            AI-заметки, которые сами организуются и напоминают о важном.
          </p>
          <div className="mt-10">
            <Link
              href="/join"
              className="group inline-flex items-center gap-2 bg-[#BFFF00] text-[#0038FF] text-base font-bold px-8 py-4 rounded-full hover:bg-[#d4ff4d] transition-colors"
            >
              Записаться на тест
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/50">
            Присоединяйтесь к закрытому бета-тестированию
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <hr className="border-white/10" />
      </div>

      {/* Links grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.svg" alt="OKAK" className="w-9 h-9" />
              <span className="font-display font-bold text-white text-xl">OKAK</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-[240px]">
              AI-заметки нового поколения. Записывай мысли — OKAK сам всё организует.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-4">
                {col.heading}
              </p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      href="#"
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <p className="text-sm text-white/40">
              © 2026 OKAK. Все права защищены.
            </p>
            <p className="text-xs text-white/30">
              ООО "ЛЕМОН КОРП" | ИНН: 9726087431 | ОГРН: 1247700713446
            </p>
          </div>

          {/* Powered by Lemon Corporation */}
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm cursor-default">
            <span className="text-xs text-gray-500 font-medium tracking-wide">Powered by</span>
            <img src="/Group 59dsfsdd.png" alt="Lemon Corporation" className="w-5 h-5 object-contain" />
            <span className="text-sm text-[#00896E] font-bold">Lemon Corporation</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-white/40 hover:text-white transition-colors">
              Конфиденциальность
            </Link>
            <Link href="/terms" className="text-sm text-white/40 hover:text-white transition-colors">
              Условия
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
