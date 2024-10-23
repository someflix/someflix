'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Star, Home, Play, X } from 'lucide-react'
import EmbedPlayer from '@/components/watch/embed-player'
import { getYear } from '@/lib/utils'
import MovieService from '@/services/MovieService'
import { useModalStore } from '@/stores/modal'
import { Show, Genre, MediaType, ShowWithGenreAndVideo } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { siteConfig } from '@/configs/site'
import { Icons } from '../icons'

interface MovieVersionSelectorProps {
  vfUrl: string
  voUrl: string
  vfAvailable: boolean
}

export default function MovieVersionSelector({
  vfUrl,
  voUrl,
  vfAvailable,
}: MovieVersionSelectorProps) {
  const [url, setUrl] = useState('')
  const [isWatching, setIsWatching] = useState(false)
  const [genres, setGenres] = useState<Genre[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const pathname = usePathname()
  const movieId = parseInt(pathname.split('/').pop() || '0')
  const modalStore = useModalStore()
  const modalContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await MovieService.findMovie(movieId)
        const data: Show = response.data
        if (data) {
          useModalStore.setState({
            show: data,
            open: true,
            play: true,
            firstLoad: true,
          })
          const genreData: ShowWithGenreAndVideo = await MovieService.findMovieByIdAndType(
            data.id,
            MediaType.MOVIE
          )
          if (genreData?.genres) {
            setGenres(genreData.genres)
          }
        }
      } catch (error) {
        console.error('Error fetching movie data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [pathname, movieId])

  const handleVersionSelect = (version: 'vo' | 'vf') => {
    setUrl(version === 'vo' ? voUrl : vfUrl)
    setIsWatching(true)
  }

  const handleClosePlayer = (e?: React.MouseEvent) => {
    if (e && modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      setIsWatching(false)
      setUrl('')
    } else if (!e) {
      setIsWatching(false)
      setUrl('')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16 px-10">
          <Button variant="ghost" asChild>
              <a href="/" aria-label="Home">
                <div className="flex items-center space-x-2">
                  <Icons.kebab className="h-6 w-6" aria-hidden="true" />
                  <span className="inline-block font-bold">{siteConfig.name}</span>
                  <span className="sr-only">Home</span>
                </div>
              </a>
          </Button>
          <div className="w-6" /> {/* Spacer for alignment */}
        </div>
      </header>
      <main className="flex-grow pt-16 flex flex-col">
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            <div className="relative h-[60vh] md:h-[70vh]">
              {modalStore.show?.backdrop_path && (
                <Image
                  src={`https://image.tmdb.org/t/p/original${modalStore.show.backdrop_path}`}
                  alt={modalStore.show.title || modalStore.show.name || 'Movie backdrop'}
                  layout="fill"
                  objectFit="cover"
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                <h2 className="text-2xl md:text-4xl font-bold text-shadow">
                  {modalStore.show?.title || modalStore.show?.name}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleVersionSelect('vo')}
                    className="bg-white text-black hover:bg-white/90"
                    size="sm"
                  >
                    <Play className="mr-2 h-4 w-4" /> Play Original
                  </Button>
                  {vfAvailable && (
                    <Button
                      onClick={() => handleVersionSelect('vf')}
                      className="bg-white text-black hover:bg-white/90"
                      size="sm"
                    >
                      <Play className="mr-2 h-4 w-4" /> Play French
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-grow flex flex-col p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Star className="text-yellow-400 h-4 w-4" />
                  <span className="font-semibold text-sm">
                    {modalStore.show?.vote_average?.toFixed(1)} / 10
                  </span>
                  <span className="text-gray-400 text-sm">
                    ({modalStore.show?.vote_count} votes)
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {modalStore.show?.release_date && `Released: ${getYear(modalStore.show.release_date)}`}
                </p>
                <p className="text-sm">{modalStore.show?.overview}</p>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-2 py-1 bg-gray-800 rounded-full text-xs"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      {isWatching && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={handleClosePlayer}
        >
          <div 
            ref={modalContentRef}
            className="relative w-full h-full max-w-4xl max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10"
              onClick={() => handleClosePlayer()}
            >
              <X className="h-6 w-6" />
            </Button>
            <EmbedPlayer url={url} />
          </div>
        </div>
      )}
    </div>
  )
}