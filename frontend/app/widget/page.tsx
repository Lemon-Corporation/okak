'use client'

import { useEffect, useState, useRef } from 'react'
import { desktopResizeWidget } from '@/lib/electron'
import { Sparkles, Bot, X } from 'lucide-react'
import { aiApi } from '@/lib/api'

export default function WidgetPage() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const recognitionRef = useRef<any>(null)
  const endTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleExpand = async () => {
    if (isExpanded) return
    await desktopResizeWidget(true)
    setIsExpanded(true)
    startRecording()
  }

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(false)
    stopRecording()
    setTranscript('')
    setResponse('')
    // Wait for collapse animation before shrinking window
    setTimeout(async () => {
      await desktopResizeWidget(false)
    }, 500)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 64
      
      setIsRecording(true)
      drawVisualizer()

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.lang = 'ru-RU'
        recognition.interimResults = true
        recognition.continuous = true

        recognition.onresult = (event: any) => {
          let currentTranscript = ''
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript
          }
          setTranscript(currentTranscript)

          if (endTimeoutRef.current) clearTimeout(endTimeoutRef.current)
          endTimeoutRef.current = setTimeout(() => {
            recognition.stop()
          }, 2000)
        }

        recognition.onend = () => {
          setIsRecording(false)
          if (endTimeoutRef.current) clearTimeout(endTimeoutRef.current)
        }

        recognitionRef.current = recognition
        recognition.start()
      }
    } catch (err) {
      console.error('Error accessing microphone', err)
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    setIsRecording(false)
  }

  const handleSendToAI = async (text: string) => {
    setIsThinking(true)
    try {
      const res = await aiApi.chat([{ role: 'user', content: text }])
      setResponse(res.content)
      
      const synth = window.speechSynthesis
      const utterance = new SpeechSynthesisUtterance(res.content)
      utterance.lang = 'ru-RU'
      synth.speak(utterance)
      
    } catch (err) {
      setResponse('Произошла ошибка')
    } finally {
      setIsThinking(false)
    }
  }

  useEffect(() => {
    if (!isRecording && transcript.trim() && recognitionRef.current) {
      handleSendToAI(transcript.trim())
      recognitionRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, transcript])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electron?.onToggleWidgetExpand) {
      window.electron.onToggleWidgetExpand(() => {
        if (!isExpanded) {
          handleExpand()
        } else {
          handleClose({ stopPropagation: () => {} } as React.MouseEvent)
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded])

  const drawVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)
      analyserRef.current!.getByteFrequencyData(dataArray)
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = 25
      
      ctx.beginPath()
      
      for (let i = 0; i < bufferLength; i++) {
        const value = dataArray[i]
        const percent = value / 255
        const height = 15 * percent
        
        const angle = (i / bufferLength) * Math.PI * 2
        const r = radius + height
        const x = centerX + Math.cos(angle) * r
        const y = centerY + Math.sin(angle) * r
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      
      ctx.closePath()
      ctx.lineWidth = 3
      ctx.strokeStyle = '#a3e635'
      ctx.stroke()
      
      ctx.fillStyle = 'rgba(163, 230, 53, 0.1)'
      ctx.fill()
    }
    
    draw()
  }

  return (
    <div className="flex h-full w-full justify-end p-5 overflow-hidden">
      <div 
        onClick={handleExpand}
        className={`group relative flex items-center p-1.5 backdrop-blur-3xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isExpanded 
            ? 'w-[400px] h-20 rounded-[2rem] bg-[#0a0a0c]/90 border border-white/10 shadow-2xl shadow-blue/20' 
            : 'w-14 h-14 rounded-full bg-transparent hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-blue/20'
        }`}
      >
        <div className={`relative flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-500 z-20 overflow-hidden ${
          isExpanded ? 'w-16 h-16 mr-3 -ml-0.5' : 'w-full h-full'
        }`}
        style={{
          transform: 'translateZ(0)',
          WebkitMaskImage: '-webkit-radial-gradient(white, black)',
          isolation: 'isolate',
        }}>
          
          {/* Base pure gradient for collapsed state */}
          <div className={`absolute inset-0 bg-gradient-to-br from-[#3b82f6] via-[#60a5fa] to-[#a3e635] rounded-full transition-opacity duration-500 ${isExpanded ? 'opacity-0' : 'opacity-100'}`} />

          {/* Expanded mode animated layers */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-blue-dark opacity-50 blur-[10px] rounded-full" />
            <div className="absolute -inset-[50%] animate-[spin_6s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,var(--color-blue),var(--color-lime),var(--color-blue-dark),var(--color-blue))] opacity-80 mix-blend-screen blur-[4px]" />
            <div className="absolute -inset-[50%] animate-[spin_10s_ease-in-out_infinite_reverse] rounded-full bg-[conic-gradient(from_180deg,transparent,var(--color-blue),var(--color-lime-dark),transparent)] opacity-90 mix-blend-overlay blur-[2px]" />
            <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-lime/40 to-blue/40 blur-[2px] animate-[pulse_4s_ease-in-out_infinite]" />
            <div className="absolute inset-[1px] rounded-full bg-background/40 backdrop-blur-[4px] border border-white/20 transition-colors" />
          </div>

          {/* Equalizer Canvas overlaps everything in the circle */}
          <canvas 
            ref={canvasRef} 
            width={80} 
            height={80} 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 pointer-events-none ${isRecording ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Only show icon in expanded mode */}
          <div className={`relative z-10 text-white/90 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            <Bot className="w-5 h-5" />
          </div>
        </div>

        <div className={`flex-1 overflow-hidden transition-all duration-500 flex flex-col justify-center pr-8 z-10 ${
          isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 w-0 hidden'
        }`}>
          {isThinking ? (
            <div className="flex items-center gap-2">
              <span className="text-white/80 font-medium text-sm">ОКАК думает</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75" />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150" />
              </span>
            </div>
          ) : response ? (
            <p className="text-white text-sm line-clamp-2 leading-snug">
              {response}
            </p>
          ) : (
            <div className="flex flex-col">
              <span className="text-[10px] text-lime/80 font-bold uppercase tracking-wider mb-0.5">
                {isRecording ? 'Слушаю вас...' : 'Ассистент'}
              </span>
              <p className="text-white text-sm line-clamp-1 opacity-90">
                {transcript || 'Произнесите запрос'}
              </p>
            </div>
          )}
        </div>

        {isExpanded && (
          <button 
            onClick={handleClose}
            className="absolute top-1/2 -translate-y-1/2 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors z-30"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
