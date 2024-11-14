'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, getSearchValue } from '@/lib/utils'
import { siteConfig } from '@/configs/site'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { useSearchStore } from '@/stores/search'
import { ModeToggle } from '@/components/theme-toggle'
import { DebouncedInput } from '@/components/debounced-input'
import MovieService from '@/services/MovieService'
import { type NavItem, type Show } from '@/types'
import { Home, Inbox, Calendar, Search, Settings, Film, Tv, Heart, User, Video, Popcorn } from 'lucide-react'

interface MainNavProps {
  items?: NavItem[]
}

interface SearchResult {
  results: Show[]
}

export default function MainNav({ items }: MainNavProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const path = usePathname()
  const router = useRouter()
  const searchStore = useSearchStore()

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 0)
  }, [])

  const handleResize = useCallback(() => {
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [handleScroll, handleResize])

  const handlePopstate = useCallback(() => {
    const pathname = window.location.pathname
    const search = getSearchValue('q')

    if (!search?.length || !pathname.includes('/search')) {
      searchStore.reset()
      searchStore.setOpen(false)
    } else if (search?.length) {
      searchStore.setOpen(true)
      searchStore.setLoading(true)
      searchStore.setQuery(search)
      MovieService.searchMovies(search)
        .then((response: SearchResult) => {
          searchStore.setShows(response.results)
        })
        .catch((e) => {
          console.error(e)
        })
        .finally(() => searchStore.setLoading(false))
    }
  }, [searchStore])

  useEffect(() => {
    window.addEventListener('popstate', handlePopstate)
    return () => window.removeEventListener('popstate', handlePopstate)
  }, [handlePopstate])

  const searchShowsByQuery = useCallback(async (value: string) => {
    if (!value?.trim()?.length) {
      if (path === '/search') {
        router.push('/home')
      } else {
        window.history.pushState(null, '', path)
      }
      return
    }

    if (getSearchValue('q')?.trim()?.length) {
      window.history.replaceState(null, '', `search?q=${value}`)
    } else {
      window.history.pushState(null, '', `search?q=${value}`)
    }

    searchStore.setQuery(value)
    searchStore.setLoading(true)
    const shows = await MovieService.searchMovies(value)
    searchStore.setLoading(false)
    searchStore.setShows(shows.results)

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [path, router, searchStore])

  const handleChangeStatusOpen = useCallback((value: boolean): void => {
    searchStore.setOpen(value)
    if (!value) searchStore.reset()
  }, [searchStore])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  return (
    <>
      <nav
        className={cn(
          'relative flex h-16 w-full items-center justify-between px-4 transition-colors duration-300 md:sticky',
          isScrolled
            ? 'bg-background/70 backdrop-blur-md shadow-md'
            : 'bg-transparent'
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden z-50"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Icons.menu className="h-6 w-6" />
        </Button>

        <div className="flex items-center justify-center md:justify-start md:gap-4 absolute left-0 right-0 mx-auto md:relative md:mx-0">
          <Link href="/" prefetch className="flex items-center space-x-2">
            <Icons.kebab className="h-6 w-6" aria-hidden="true" />
            <span className="font-bold">{siteConfig.name}</span>
          </Link>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          {items?.map(
            (item, index) =>
              item.href && (
                <Link
                  key={index}
                  href={item.href}
                  prefetch
                  className={cn(
                    'text-sm font-medium text-foreground/60 transition hover:text-foreground/80',
                    path === item.href && 'font-bold text-foreground',
                    item.disabled && 'cursor-not-allowed opacity-80'
                  )}
                  onClick={() => handleChangeStatusOpen(false)}
                >
                  {item.title}
                </Link>
              )
          )}
        </div>
        <div className="flex items-center gap-4">
          <DebouncedInput
            id="search-input"
            open={searchStore.isOpen}
            value={searchStore.query}
            onChange={searchShowsByQuery}
            onChangeStatusOpen={handleChangeStatusOpen}
            containerClassName="flex"
          />
          <div className="hidden md:block">
            <ModeToggle />
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={toggleSidebar}
            />
            <motion.aside
              key="sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-background/20 backdrop-blur-md shadow-lg flex flex-col"
            >
              <div className="flex h-16 items-center justify-between px-4">
                <Link href="/" prefetch className="flex items-center space-x-2" onClick={toggleSidebar}>
                  <Icons.kebab className="h-6 w-6" aria-hidden="true" />
                  <span className="font-bold">{siteConfig.name}</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Close menu">
                  <Icons.close className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex-grow px-4 py-4">
                {items?.map((item, index) => {
                  let Icon
                  switch (item.title.toLowerCase()) {
                    case 'home':
                      Icon = Home
                      break
                    case 'movies':
                      Icon = Film
                      break
                    case 'tv & sports':
                      Icon = Tv
                      break
                    case 'favorites':
                      Icon = Heart
                      break
                    case 'profile':
                      Icon = User
                      break
                    case 'series':
                      Icon = Video
                      break
                    case 'new & popular':
                      Icon = Popcorn
                      break
                    case 'search':
                      Icon = Search
                      break
                    case 'settings':
                      Icon = Settings
                      break
                    default:
                      Icon = Home // Default icon
                  }
                  return (
                    <Link
                      key={index}
                      href={item.href || '#'}
                      prefetch
                      className={cn(
                        'flex items-center gap-4 py-3 text-base font-medium text-foreground/60 transition hover:text-foreground/80',
                        path === item.href && 'font-bold text-foreground',
                        item.disabled && 'cursor-not-allowed opacity-80'
                      )}
                      onClick={() => {
                        handleChangeStatusOpen(false)
                        toggleSidebar()
                      }}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </nav>
              <div className="mt-auto border-t">
                <div className="px-4 py-4">
                  <ModeToggle isMobile={true} />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}