'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { addToRecentlyWatched } from '@/utils/recentlyWatched'

export default function WatchLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.startsWith('/watch/')) {
      addToRecentlyWatched(pathname.slice(6)) // Remove '/watch' from the beginning
    }
  }, [pathname])

  return <>{children}</>
}