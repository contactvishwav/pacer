import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyProps {
  title: string
  description?: string
  icon?: ReactNode
  className?: string
}

export function Empty({ title, description, icon, className }: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
