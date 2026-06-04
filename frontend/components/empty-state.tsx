import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  isSearch?: boolean
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  isSearch = false
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue/10 blur-2xl rounded-full" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/50 border border-border shadow-sm">
          <Icon className="h-10 w-10 text-muted-foreground/40" />
        </div>
      </div>
      
      <h3 className="mb-2 text-xl font-bold text-foreground">
        {title}
      </h3>
      <p className="mb-8 max-w-[280px] text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      
      {actionLabel && onAction && !isSearch && (
        <Button 
          onClick={onAction}
          className="bg-blue text-white hover:bg-blue-dark h-11 px-6 rounded-xl font-bold shadow-lg shadow-blue/20"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
