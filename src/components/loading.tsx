import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LoadingProps {
  lines?: number
  className?: string
}

export function Loading({ lines = 3, className }: LoadingProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4 rounded-md bg-muted',
            i === 0 && 'w-3/4',
            i === lines - 1 && lines > 1 && 'w-1/2',
          )}
        />
      ))}
    </div>
  )
}
