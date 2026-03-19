"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"

const links = [
  { label: "Продукт", href: "#features" },
  { label: "Как работает", href: "#how" },
  { label: "Тарифы", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="fixed top-4 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4">
        <div 
          className={`rounded-full transition-all duration-300 ${
            scrolled 
              ? "bg-[#0038FF]/95 backdrop-blur-md py-2 px-2" 
              : "bg-transparent py-2 px-2"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 pl-2">
              <Image src="/logo.svg" alt="OKAK" width={36} height={36} className="w-9 h-9" />
              <span className="text-white font-display font-bold text-xl tracking-tight">OKAK</span>
            </Link>

            {/* Desktop nav - centered pill */}
            <nav className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all px-4 py-2 rounded-full"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-2 pr-2">
              <Link href="#" className="text-sm text-white/80 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/10">
                Войти
              </Link>
              <Link href="#" className="text-sm font-bold bg-[#BFFF00] text-[#0038FF] px-5 py-2.5 rounded-full hover:bg-[#d4ff4d] transition-colors">
                Попробовать
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center text-white rounded-full hover:bg-white/10 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Меню"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-[#0038FF] mx-4 mt-2 rounded-2xl">
          <div className="px-6 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-base text-white py-3 border-b border-white/10" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <Link href="#" className="text-base text-white/70 py-2" onClick={() => setOpen(false)}>Войти</Link>
              <Link href="#" className="text-center text-sm font-bold bg-[#BFFF00] text-[#0038FF] px-5 py-3.5 rounded-full" onClick={() => setOpen(false)}>
                Попробовать бесплатно
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
