import { useState, useCallback, useEffect } from 'react'

interface UseFileDropProps {
  onDrop: (files: File[]) => void | Promise<void>
}

export function useFileDrop({ onDrop }: UseFileDropProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await onDrop(files)
    }
  }, [onDrop])

  return {
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop
  }
}
