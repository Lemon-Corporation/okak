'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { onDesktopBroadcast } from '@/lib/electron'

export function HighlightOverlay() {
  const [highlight, setHighlight] = useState<{ element: string; text: string } | null>(null)
  const [bounds, setBounds] = useState<{ top: number; left: number; width: number; height: number } | null>(null)

  useEffect(() => {
    onDesktopBroadcast('app:highlight', (data: { element: string; text: string } | null) => {
      if (!data) {
        setHighlight(null)
        setBounds(null)
        return
      }

      // Try to find the element
      const el = document.querySelector(`[data-tour="${data.element}"]`) || document.querySelector(`.${data.element}`)
      if (el) {
        const rect = el.getBoundingClientRect()
        setBounds({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        })
        setHighlight(data)
      } else {
        setHighlight(null)
        setBounds(null)
      }
    })
  }, [])

  if (!highlight || !bounds) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        {/* Dark backdrop with hole */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40"
          style={{
            clipPath: `polygon(
              0% 0%, 
              0% 100%, 
              ${bounds.left}px 100%, 
              ${bounds.left}px ${bounds.top}px, 
              ${bounds.left + bounds.width}px ${bounds.top}px, 
              ${bounds.left + bounds.width}px ${bounds.top + bounds.height}px, 
              ${bounds.left}px ${bounds.top + bounds.height}px, 
              ${bounds.left}px 100%, 
              100% 100%, 
              100% 0%
            )`
          }}
        />

        {/* Highlight border */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute border-2 border-lime rounded-xl shadow-[0_0_20px_rgba(163,230,53,0.5)]"
          style={{
            top: bounds.top - 4,
            left: bounds.left - 4,
            width: bounds.width + 8,
            height: bounds.height + 8,
          }}
        />

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bg-lime text-black px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl"
          style={{
            top: bounds.top + bounds.height + 12,
            left: bounds.left + (bounds.width / 2),
            translateX: '-50%'
          }}
        >
          {highlight.text}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
