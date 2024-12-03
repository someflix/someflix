'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Film, Tv, Radio } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'

export default function MobileNavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true)
    }
  }, [])

  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    router.push(href)
  }, [router])

  if (!isStandalone) {
    return null
  }

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/movies', icon: Film, label: 'Movies' },
    { href: '/tv-shows', icon: Tv, label: 'Series' },
    { href: '/iptv', icon: Radio, label: 'TV Channels' },
  ]

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="backdrop-blur-lg bg-black/30 text-white rounded-full">
        <ul className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={(e) => handleLinkClick(e, item.href)} className="flex flex-col items-center p-2">
                <item.icon
                  className={`w-6 h-6 ${
                    pathname === item.href ? 'text-blue-400' : 'text-gray-400'
                  }`}
                />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}