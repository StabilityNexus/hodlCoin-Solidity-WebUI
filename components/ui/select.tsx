// Select.tsx
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export const Select = ({ children }: { children: React.ReactNode }) => {
  return <div className='relative'>{children}</div>
}

export const SelectTrigger = ({
  onClick,
  children,
  isOpen,
  className,
}: {
  onClick: () => void
  children: React.ReactNode
  isOpen: boolean
  className?: string
}) => {
  return (
    <div
      className={`cursor-pointer flex items-center justify-between bg-white-900/20 border border-purple-700/50 text-purple-100 p-2 rounded ${className}`}
      onClick={onClick}
    >
      {children}
      {isOpen ? (
        <ChevronUp className='h-4 w-4 text-purple-400' />
      ) : (
        <ChevronDown className='h-4 w-4 text-purple-400' />
      )}
    </div>
  )
}

export const SelectContent = ({
  isOpen,
  children,
  className,
}: {
  isOpen: boolean
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div
      className={`absolute z-10 bg-white text-zinc-900 border border-zinc-300 rounded mt-2 w-full shadow-lg ${
        isOpen ? 'block' : 'hidden'
      } ${className}`}
    >
      {children}
    </div>
  )
}

export const SelectItem = ({
  onClick,
  children,
  isSelected,
  className,
}: {
  onClick: () => void
  children: React.ReactNode
  isSelected?: boolean
  className?: string
}) => {
  return (
    <div
      className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-zinc-100 text-zinc-900 ${
        isSelected ? 'font-semibold' : ''
      } ${className}`}
      onClick={onClick}
    >
      {isSelected && <span className='text-purple-500'>✓</span>}
      {children}
    </div>
  )
}

export const SelectValue = ({ value }: { value: string | null }) => {
  return <p>{value || 'Select an option'}</p>
}
