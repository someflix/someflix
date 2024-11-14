'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const SIDEBAR_WIDTH = '16rem'

type SidebarContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SidebarProvider({
  children,
  defaultOpen = false,
}: SidebarProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSidebar()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-[300px] p-0">
        {children}
      </SheetContent>
    </Sheet>
  )
}

export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b px-4 py-2">{children}</div>
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-auto py-2">{children}</div>
}

export function SidebarFooter({ children }: { children: React.ReactNode }) {
  return <div className="border-t px-4 py-2">{children}</div>
}

export function SidebarTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const Comp = asChild ? Slot : SheetTrigger
  return <Comp>{children}</Comp>
}

const sidebarMenuItemVariants = cva(
  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
  {
    variants: {
      isActive: {
        true: 'bg-accent text-accent-foreground',
        false: 'text-foreground/60',
      },
    },
    defaultVariants: {
      isActive: false,
    },
  }
)

export interface SidebarMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuItemVariants> {
  asChild?: boolean
}

export const SidebarMenuItem = React.forwardRef<HTMLButtonElement, SidebarMenuItemProps>(
  ({ className, isActive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(sidebarMenuItemVariants({ isActive }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
SidebarMenuItem.displayName = 'SidebarMenuItem'

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <nav className="space-y-1 px-2">{children}</nav>
}

export function SidebarClose() {
  const { setOpen } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
      onClick={() => setOpen(false)}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </Button>
  )
}

const sidebarMenuButtonVariants = cva(
  'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      isActive: {
        true: 'bg-accent text-accent-foreground',
        false: 'text-foreground/60',
      },
    },
    defaultVariants: {
      isActive: false,
    },
  }
)

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(sidebarMenuButtonVariants({ isActive }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
SidebarMenuButton.displayName = 'SidebarMenuButton'