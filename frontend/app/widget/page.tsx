'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { desktopGetWidgetBounds, desktopHideOverlay, desktopResizeWidget, desktopSetWidgetBounds, desktopWriteLog, onDesktopHideWidget, desktopBroadcast, onDesktopBroadcast } from '@/lib/electron'
import { Bot, Mic, BrainCircuit, AudioLines, Moon, X, StickyNote, CheckSquare, FolderKanban, Sparkles } from 'lucide-react'
import { aiApi } from '@/lib/api'

export default function WidgetPage() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
  const [isDropActive, setIsDropActive] = useState(false)
  const [isDraggingWidget, setIsDraggingWidget] = useState(false)
  const [isDragAnimating, setIsDragAnimating] = useState(false)
  const [activeAction, setActiveAction] = useState<'note' | 'task' | 'project' | null>(null)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const recognitionRef = useRef<any>(null)
  const endTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const dragBoundsRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null)
  const dragMovedRef = useRef(false)
  const dragRafRef = useRef<number | null>(null)

  const logToDebug = (message: string, data?: any) => {
    try {
      const logMessage = `[${new Date().toISOString()}] ${message} ${data !== undefined ? (typeof data === 'object' ? JSON.stringify(data) : data) : ''}`;
      console.log(message, data !== undefined ? data : '');
      desktopWriteLog(logMessage);
    } catch (err) {
      console.error('Logging failed', err);
    }
  };

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current)
    }
    inactivityTimeoutRef.current = setTimeout(() => {
      logToDebug('Inactivity timeout reached, collapsing widget')
      handleClose()
    }, 10000) // 10 seconds of silence/inactivity to collapse
  }, [])

  const stopInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current)
      inactivityTimeoutRef.current = null
    }
  }, [])

  const startRecording = async () => {
    logToDebug('startRecording starting...')
    try {
      logToDebug('Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      logToDebug('Microphone access granted, stream:', stream.id)
      
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioContext()
      logToDebug('AudioContext created, state:', audioContextRef.current.state)
      
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 64
      
      setIsRecording(true)
      logToDebug('isRecording set to true, starting visualizer')
      drawVisualizer()

      // Set up MediaRecorder for STT
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        logToDebug('Recording stopped, blob size:', audioBlob.size)
        
        if (audioBlob.size > 1000) {
          const formData = new FormData()
          formData.append('file', audioBlob, 'voice.webm')
          
          try {
            logToDebug('Sending to STT...')
            const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
            const headers: HeadersInit = {}
            if (typeof window !== 'undefined') {
              const token = localStorage.getItem('okak_access_token')
              if (token) headers['Authorization'] = `Bearer ${token}`
            }
            const res = await fetch(`${BASE_URL}/ai/stt`, {
              method: 'POST',
              headers,
              body: formData,
            })
            
            if (res.status === 401) {
              logToDebug('STT failed: Unauthorized')
              setIsUnauthorized(true)
              setResponse('Пожалуйста, авторизуйтесь')
              await playTTS('Пожалуйста, авторизуйтесь в приложении')
              return
            }

            if (res.ok) {
              const { transcript: text } = await res.json()
              logToDebug('STT result:', text)
              if (text && text.trim()) {
                setTranscript(text)
                handleSendToAI(text)
              }
            } else {
              logToDebug('STT failed:', res.status)
            }
          } catch (err) {
            logToDebug('STT request error:', err)
          }
        }
        
        setIsRecording(false)
        stream.getTracks().forEach(track => track.stop())
      }

      // Voice activity detection (simple silence timeout)
      let silenceTimer: NodeJS.Timeout
      const checkSilence = () => {
        const dataArray = new Uint8Array(analyserRef.current!.frequencyBinCount)
        analyserRef.current!.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        
        if (average < 10) { // Threshold for silence
          if (!silenceTimer) {
            silenceTimer = setTimeout(() => {
              logToDebug('Silence detected, stopping recorder')
              mediaRecorder.stop()
            }, 2000)
          }
        } else {
          if (silenceTimer) {
            clearTimeout(silenceTimer)
            silenceTimer = null as any
          }
        }
        
        if (mediaRecorder.state === 'recording') {
          requestAnimationFrame(checkSilence)
        }
      }

      mediaRecorder.start()
      logToDebug('MediaRecorder started')
      requestAnimationFrame(checkSilence)

    } catch (err) {
      logToDebug('Error accessing microphone:', err)
    }
  }

  const stopRecording = useCallback(() => {
    logToDebug('stopRecording called')
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
  }, [])

  const playTTS = async (text: string): Promise<void> => {
    logToDebug('playTTS starting for:', text)
    return new Promise(async (resolve) => {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('okak_access_token')
          if (token) headers['Authorization'] = `Bearer ${token}`
        }
        const res = await fetch(`${BASE_URL}/ai/tts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ text }),
        })

        if (!res.ok) {
          logToDebug('TTS fetch failed:', res.status)
          resolve()
          return
        }

        const blob = await res.blob()
        logToDebug('TTS blob received, size:', blob.size)
        
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio()
        audio.src = audioUrl
        
        audio.onplay = () => {
          logToDebug('Audio playback started')
          setIsPlaying(true)
        }
        audio.onerror = (e: any) => {
          logToDebug('Audio element error:', e)
          setIsPlaying(false)
          resolve()
        }
        
        audio.onended = () => {
          logToDebug('Audio playback ended')
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
          resolve()
        }

        await audio.play().catch(e => {
          logToDebug('Audio play() failed:', e)
          setIsPlaying(false)
          resolve()
        })
      } catch (err) {
        logToDebug('TTS failed', err)
        resolve()
      }
    })
  }

  const handleClose = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIsExpanded(false)
    stopRecording()
    stopInactivityTimer()
    setTranscript('')
    setResponse('')
    setMessages([]) // clear context on close
    // Wait for collapse animation before shrinking window
    setTimeout(async () => {
      await desktopResizeWidget(false)
    }, 500)
  }

  const handleExpand = async () => {
    logToDebug('handleExpand called');
    if (isExpanded) return;
    try {
      setIsExpanded(true);
      logToDebug('isExpanded set to true');
      
      // 1. Resize widget
      await desktopResizeWidget(true);
      logToDebug('desktopResizeWidget(true) done');

      // 2. Reset and start inactivity timer
      resetInactivityTimer();
      
      // 3. Start recording immediately (no greeting)
      startRecording();
      
    } catch (err) {
      logToDebug('handleExpand error:', err);
    }
  };

  const handleSendToAI = async (text: string) => {
    logToDebug('Sending to AI:', text)
    setIsThinking(true)
    stopInactivityTimer() // Stop timer while AI is processing
    
    // Add user message to local state immediately
    const userMessage = { role: 'user' as const, content: text };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);

    try {
      const res = await aiApi.chat(currentMessages)
      logToDebug('AI Response received:', res)
      
      // Detect action from response content
      const lowerRes = res.content.toLowerCase()
      if (lowerRes.includes('заметк')) {
        setActiveAction('note')
        desktopBroadcast('app:sync-data', { type: 'note' })
        setTimeout(() => setActiveAction(null), 2500)
      } else if (lowerRes.includes('задач')) {
        setActiveAction('task')
        desktopBroadcast('app:sync-data', { type: 'task' })
        setTimeout(() => setActiveAction(null), 2500)
      } else if (lowerRes.includes('проект')) {
        setActiveAction('project')
        desktopBroadcast('app:sync-data', { type: 'project' })
        setTimeout(() => setActiveAction(null), 2500)
      }

      // Detection for navigation
      if (lowerRes.includes('откр') || lowerRes.includes('перей')) {
        if (lowerRes.includes('заметк')) desktopBroadcast('app:navigate', '/notes')
        else if (lowerRes.includes('задач')) desktopBroadcast('app:navigate', '/tasks')
        else if (lowerRes.includes('проект')) desktopBroadcast('app:navigate', '/projects')
        else if (lowerRes.includes('файл')) desktopBroadcast('app:navigate', '/files')
        else if (lowerRes.includes('настрой')) desktopBroadcast('app:navigate', '/settings')
        else if (lowerRes.includes('главн') || lowerRes.includes('простран')) desktopBroadcast('app:navigate', '/space')
      }

      setResponse(res.content)
      
      // Add assistant response to local state
      setMessages([...currentMessages, { role: 'assistant', content: res.content }]);
      
      await playTTS(res.content)
      
      // After AI finishes speaking, check if we should continue listening
      if (isExpanded) {
        logToDebug('AI finished speaking, starting to listen again')
        setTranscript('')
        startRecording()
        resetInactivityTimer() // Restart inactivity timer after AI finishes
      }
    } catch (err: any) {
      logToDebug('handleSendToAI error:', err)
      if (err.status === 401) {
        setIsUnauthorized(true)
        setResponse('Пожалуйста, авторизуйтесь')
        await playTTS('Пожалуйста, авторизуйтесь в приложении')
      } else {
        setResponse('Произошла ошибка')
        resetInactivityTimer()
      }
    } finally {
      setIsThinking(false)
    }
  }

  useEffect(() => {
    if (!isRecording && transcript.trim() && recognitionRef.current) {
      logToDebug('Voice input finished, transcript:', transcript.trim())
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
          handleClose()
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded])

  useEffect(() => {
    onDesktopHideWidget(() => {
      void handleClose()
    })

    // Listen for auth changes from main window
    onDesktopBroadcast('app:auth-changed', (data: { status: string }) => {
      logToDebug('Auth status changed:', data.status)
      if (data.status === 'logged_out') {
        setIsUnauthorized(true)
        setResponse('Вы вышли из аккаунта')
        setMessages([])
      } else if (data.status === 'logged_in') {
        setIsUnauthorized(false)
        setResponse('')
      }
    })
  }, [])

  const handleWidgetPointerDown = useCallback(async (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const bounds = await desktopGetWidgetBounds()
    if (!bounds) return

    dragStartRef.current = { x: e.screenX, y: e.screenY }
    dragBoundsRef.current = bounds
    dragMovedRef.current = false
    setIsDraggingWidget(true)
    setIsDragAnimating(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const handleWidgetPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingWidget || !dragStartRef.current || !dragBoundsRef.current) return
    const dx = e.screenX - dragStartRef.current.x
    const dy = e.screenY - dragStartRef.current.y
    if (Math.abs(dx) + Math.abs(dy) > 4) {
      dragMovedRef.current = true
    }

    const nextBounds = {
      ...dragBoundsRef.current,
      x: dragBoundsRef.current.x + dx,
      y: dragBoundsRef.current.y + dy,
    }

    if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current)
    dragRafRef.current = requestAnimationFrame(() => {
      void desktopSetWidgetBounds(nextBounds)
    })
  }, [isDraggingWidget])

  const handleWidgetPointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDraggingWidget) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    setIsDraggingWidget(false)
    dragStartRef.current = null
    dragBoundsRef.current = null
    if (dragRafRef.current) {
      cancelAnimationFrame(dragRafRef.current)
      dragRafRef.current = null
    }
    // Keep animation state for smooth transition back
    setTimeout(() => setIsDragAnimating(false), 200)
  }, [isDraggingWidget])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        e.preventDefault()
        void handleClose()
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'h') {
        e.preventDefault()
        void desktopHideOverlay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!isDropActive) setIsDropActive(true)
  }, [isDropActive])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDropActive(false)
  }, [])

  const handleFileDrop = useCallback(async (file: File) => {
    const message = `Файл «${file.name}» получен. Что с ним сделать?`
    setResponse(message)
    await playTTS(message)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDropActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      void handleFileDrop(file)
    }
  }, [handleFileDrop])

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
    <div 
      className={`relative flex h-full w-full justify-end overflow-hidden ${isExpanded ? 'p-2' : 'p-0'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDropActive && (
        <div className="absolute inset-0 z-40 flex items-center justify-center rounded-2xl border border-white/20 bg-black/40 text-sm font-medium text-white backdrop-blur">
          Отпустите файл, чтобы отправить его ассистенту
        </div>
      )}
      <div 
        onClick={(e) => {
          if (!isExpanded) {
            if (dragMovedRef.current) {
              dragMovedRef.current = false
              return
            }
            e.preventDefault();
            e.stopPropagation();
            logToDebug('Outer div clicked');
            handleExpand();
          }
        }}
        className={`group relative flex items-center backdrop-blur-3xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isExpanded 
            ? 'w-[400px] h-20 rounded-[2rem] bg-[#0a0a0c]/90 border border-white/10 shadow-2xl shadow-blue/20 p-1.5' 
            : 'w-14 h-14 rounded-full bg-transparent hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-blue/20'
        }`}
        style={{ 
          WebkitAppRegion: 'no-drag',
        } as React.CSSProperties}
      >
        <div 
          onClick={(e) => {
            if (isExpanded) return;
            e.preventDefault();
            e.stopPropagation();
            logToDebug('Inner circle clicked');
            handleExpand();
          }}
          onPointerDown={handleWidgetPointerDown}
          onPointerMove={handleWidgetPointerMove}
          onPointerUp={handleWidgetPointerUp}
          onPointerCancel={handleWidgetPointerUp}
          className={`relative flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-500 z-20 overflow-hidden ${
            isExpanded ? 'w-16 h-16 mr-3 -ml-0.5' : 'w-full h-full'
          } ${isDragAnimating ? 'scale-110 shadow-[0_0_24px_rgba(59,130,246,0.35)]' : ''}`}
          style={{
            transform: 'translateZ(0)',
            WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            isolation: 'isolate',
            WebkitAppRegion: 'no-drag',
          } as React.CSSProperties}>
          
          {/* Base pure gradient for collapsed state */}
          <div className={`absolute inset-0 bg-gradient-to-br ${isUnauthorized ? 'from-red-500 via-red-600 to-orange-500' : 'from-[#3b82f6] via-[#60a5fa] to-[#a3e635]'} rounded-full transition-opacity duration-500 ${isExpanded ? 'opacity-0' : 'opacity-100'}`} />

          {/* Expanded mode animated layers */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`absolute inset-0 ${isUnauthorized ? 'bg-red-900' : 'bg-blue-dark'} opacity-50 blur-[10px] rounded-full`} />
            <div className={`absolute -inset-[50%] animate-[spin_6s_linear_infinite] rounded-full ${isUnauthorized ? 'bg-[conic-gradient(from_0deg,var(--color-red-500),var(--color-orange-500),var(--color-red-900),var(--color-red-500))]' : 'bg-[conic-gradient(from_0deg,var(--color-blue),var(--color-lime),var(--color-blue-dark),var(--color-blue))]'} opacity-80 mix-blend-screen blur-[4px]`} />
            <div className={`absolute -inset-[50%] animate-[spin_10s_ease-in-out_infinite_reverse] rounded-full ${isUnauthorized ? 'bg-[conic-gradient(from_180deg,transparent,var(--color-red-500),var(--color-orange-700),transparent)]' : 'bg-[conic-gradient(from_180deg,transparent,var(--color-blue),var(--color-lime-dark),transparent)]'} opacity-90 mix-blend-overlay blur-[2px]`} />
            <div className={`absolute inset-1 rounded-full bg-gradient-to-tr ${isUnauthorized ? 'from-orange-500/40 to-red-500/40' : 'from-lime/40 to-blue/40'} blur-[2px] animate-[pulse_4s_ease-in-out_infinite]`} />
            <div className="absolute inset-[1px] rounded-full bg-background/40 backdrop-blur-[4px] border border-white/20 transition-colors" />
          </div>

          {/* Equalizer Canvas overlaps everything in the circle */}
          <canvas 
            ref={canvasRef} 
            width={80} 
            height={80} 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 pointer-events-none ${isRecording ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Dynamic Avatar */}
          <div className={`relative z-10 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-80'} ${
            isThinking ? 'text-blue-400' : 
            isPlaying ? 'text-lime' : 
            isRecording ? 'text-red-400' : 
            'text-white/90'
          }`}>
            {isRecording ? (
              <Mic className="w-5 h-5 animate-pulse" />
            ) : isThinking ? (
              <BrainCircuit className="w-5 h-5 animate-bounce" />
            ) : isPlaying ? (
              <AudioLines className="w-5 h-5 animate-pulse" />
            ) : !isExpanded ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Bot className="w-5 h-5" />
            )}
          </div>

          {/* Flying Action Visualization */}
          <AnimatePresence>
            {activeAction && (
              <>
                <motion.div
                  initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1, 0.8], 
                    x: 280, 
                    y: -10, 
                    opacity: [0, 1, 1, 0],
                    rotate: [0, 15, -15, 45]
                  }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute z-50 text-lime pointer-events-none"
                >
                  {activeAction === 'note' && <StickyNote className="w-6 h-6 drop-shadow-[0_0_8px_rgba(163,230,53,0.8)]" />}
                  {activeAction === 'task' && <CheckSquare className="w-6 h-6 drop-shadow-[0_0_8px_rgba(163,230,53,0.8)]" />}
                  {activeAction === 'project' && <FolderKanban className="w-6 h-6 drop-shadow-[0_0_8px_rgba(163,230,53,0.8)]" />}
                </motion.div>
                
                {/* Sparkles trailing effect */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      x: 200 + (i * 20),
                      y: -5 + (Math.sin(i) * 10),
                      opacity: [0, 0.8, 0]
                    }}
                    transition={{ duration: 0.8, delay: 0.2 + (i * 0.1) }}
                    className="absolute z-40 text-blue-300 pointer-events-none"
                  >
                    <Sparkles className="w-3 h-3" />
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        <div 
          className={`flex-1 overflow-hidden transition-all duration-500 flex flex-col justify-center pr-8 z-10 ${
            isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 w-0 hidden'
          }`}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
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
              <span className="text-[10px] text-lime/80 font-bold uppercase tracking-wider mb-1">
                {isRecording ? 'Слушаю вас...' : 'Ассистент'}
              </span>
              <p className="text-white text-sm line-clamp-1 opacity-90 mt-1">
                {transcript || 'Слушаю...'}
              </p>
            </div>
          )}
        </div>

        {isExpanded && (
          <button 
            onClick={handleClose}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="absolute top-1/2 -translate-y-1/2 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors z-30"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
