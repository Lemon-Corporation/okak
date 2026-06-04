import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileDropOverlayProps {
  isDragging: boolean
  isUploading?: boolean
  className?: string
}

export function FileDropOverlay({
  isDragging,
  isUploading = false,
  className
}: FileDropOverlayProps) {
  return (
    <AnimatePresence>
      {(isDragging || isUploading) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-colors",
            isDragging && !isUploading && "bg-blue-500/10",
            className
          )}
        >
          <motion.div
            initial={{ scale: 0.9, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-card border-2 border-dashed border-blue-500 shadow-2xl"
          >
            {isUploading ? (
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            ) : (
              <Upload className="h-12 w-12 text-blue-500" />
            )}
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground">
                {isUploading ? 'Загружаем файлы...' : 'Отпустите, чтобы загрузить'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isUploading ? 'Пожалуйста, подождите' : 'Файлы будут прикреплены к текущему проекту'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
