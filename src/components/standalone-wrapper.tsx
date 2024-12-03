'use client'

import { useEffect, useState } from 'react'

export default function StandaloneWrapper({ children }: { children: React.ReactNode }) {
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true)
    }
  }, [])

  return (
    <main className={isStandalone ? 'mt-8' : ''}>
      {children}
    </main>
  )
}