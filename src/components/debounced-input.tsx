'use client'

import * as React from 'react'
import { cn, debounce } from '@/lib/utils'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input, type InputProps } from '@/components/ui/input'
import { useOnClickOutside } from '@/hooks/use-on-click-outside'
import { X } from 'lucide-react'

interface DebouncedInputProps extends Omit<InputProps, 'onChange'> {
  containerClassName?: string
  value: string
  open: boolean
  onChange: (value: string) => Promise<void>
  onChangeStatusOpen: (value: boolean) => void
  debounceTimeout?: number
  maxLength?: number
  themeToggle?: React.ReactNode;
}

export function DebouncedInput({
  id = 'query',
  containerClassName,
  open,
  value,
  onChange,
  maxLength = 80,
  debounceTimeout = 300,
  onChangeStatusOpen,
  className,
  themeToggle,
  ...props
}: DebouncedInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // Adjust this breakpoint as needed
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // close search input on clicking outside,
  useOnClickOutside(inputRef, () => {
    if (!value) onChangeStatusOpen(false)
  })

  // configure keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // close search input on pressing escape
      if (e.key === 'Escape') {
        void onChange('')
        onChangeStatusOpen(false)
      }
      // open search input on pressing ctrl + k or cmd + k
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        if (!inputRef.current) return
        e.preventDefault()
        onChangeStatusOpen(true)
        inputRef.current.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onChange, onChangeStatusOpen])

  const debounceInput = React.useCallback(
    debounce((value) => {
      const strValue = value as string
      void onChange(strValue)
    }, debounceTimeout),
    [onChange, debounceTimeout]
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debounceInput(event.target.value)
  }

  const handleClose = () => {
    void onChange('')
    onChangeStatusOpen(false)
  }

  return (
    <div className={cn('relative flex items-center', containerClassName, isMobile && open && 'fixed inset-x-0 top-0 z-50 bg-background/80 backdrop-blur-sm p-2')}>
      <Input
        ref={inputRef}
        id={id}
        type="text"
        placeholder="Search..."
        className={cn(
          'h-auto rounded-full py-2 pl-10 pr-16 text-sm transition-all duration-300 ease-in-out',
          open
            ? isMobile
              ? 'w-[calc(100%-4rem)] bg-secondary/80 shadow-md'
              : 'w-40 bg-secondary/80 shadow-md md:w-48 lg:w-64'
            : 'w-0 bg-transparent opacity-0 absolute right-8',
          'border-none focus:ring-1 focus:ring-primary/30 focus-visible:ring-1 focus-visible:ring-primary/30',
          className
        )}
        defaultValue={value}
        maxLength={maxLength}
        onChange={handleChange}
        {...props}
      />
      <div className="group">
        <Button
          id="search-btn"
          aria-label="Search"
          variant="ghost"
          className={cn(
            'h-auto rounded-full p-2 hover:bg-primary/10 transition-all duration-300 ease-in-out',
            open
              ? 'absolute left-2 top-1/2 -translate-y-1/2'
              : isMobile
                ? 'relative'
                : 'absolute right-0 top-1/2 -translate-y-1/2'
          )}
          onClick={() => {
            if (!inputRef.current) {
              return
            }
            inputRef.current.focus()
            onChangeStatusOpen(!open)
          }}>
          <Icons.search
            className={cn(
              'transition-opacity hover:opacity-75 active:scale-95 transform transition-transform group-hover:scale-110',
              open ? 'h-4 w-4' : 'h-5 w-5'
            )}
            aria-hidden="true"
          />
        </Button>
      </div>
      {!open && themeToggle}
      {open && (
        <Button
          aria-label="Close search"
          variant="ghost"
          className="absolute right-10 top-1/2 h-auto -translate-y-1/2 rounded-full p-2 hover:bg-primary/10 transition-all duration-300 ease-in-out"
          onClick={handleClose}>
          <X className="h-4 w-4 opacity-70" aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}