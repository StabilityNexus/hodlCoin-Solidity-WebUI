'use client'

import { RefreshCw, Loader2, Vault } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  variant?: 'page' | 'vault' | 'sync'
  message?: string
  className?: string
}

export function Loading({ 
  variant = 'page', 
  message = 'Loading...', 
  className 
}: LoadingProps) {
  if (variant === 'page') {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16 space-y-4', className)}>
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-r-purple-500/40 animate-spin" 
               style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-gradient">{message}</h3>
          <p className="text-sm text-muted-foreground">Please wait while we load the data</p>
        </div>
      </div>
    )
  }

  if (variant === 'vault') {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 space-y-6', className)}>
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
          {/* Inner vault icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Vault className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-base font-medium text-gradient">{message}</h3>
          <div className="flex items-center justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'sync') {
    return (
      <div className={cn('flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary/5 border border-primary/20', className)}>
        <RefreshCw className="h-5 w-5 text-primary animate-spin" />
        <div className="flex-1">
          <p className="text-sm font-medium text-primary">{message}</p>
          <div className="flex items-center space-x-1 mt-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1 h-1 bg-primary/40 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Default fallback
  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{message}</span>
    </div>
  )
} 