'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronLeft, ChevronRight, Star, Home, Play } from 'lucide-react'
import EmbedPlayer from '@/components/watch/embed-player'
import EpisodeSelector from '@/components/watch/EpisodeSelector'
import { getYear } from '@/lib/utils'
import MovieService from '@/services/MovieService'
import { useModalStore } from '@/stores/modal'
import { Show, Genre, MediaType, ShowWithGenreAndVideo } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Icons } from '../icons'
import { siteConfig } from '@/configs/site'

interface SeriesVersionSelectorProps {
  vfUrl: string
  voUrl: string
  episodes: { [key: string]: number }
  engEpisodes: { [key: string]: number }
}

export default function SeriesVersionSelector({
  vfUrl,
  voUrl,
  episodes,
  engEpisodes,
}: SeriesVersionSelectorProps) {
  const [url, setUrl] = useState(voUrl)
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null)
  const [isWatching, setIsWatching] = useState(false)
  const [genres, setGenres] = useState<Genre[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const pathname = usePathname()
  const movieId = parseInt(pathname.split('/').pop() || '0')
  const modalStore = useModalStore()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await MovieService.findTvSeries(movieId)
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
            data.media_type === MediaType.TV ? 'tv' : 'movie'
          )
          if (genreData?.genres) {
            setGenres(genreData.genres)
          }
        }
      } catch (error) {
        console.error('Error fetching series data:', error)
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

  const handleEpisodeSelect = (season: number, episode: number) => {
    setSelectedSeason(season)
    setSelectedEpisode(episode)
    setUrl(
      url.includes(vfUrl)
        ? `${vfUrl}&sa=${season}&epi=${episode}`
        : `${voUrl}/${season}/${episode}`
    )
    setIsWatching(true)
  }

  const handleNextEpisode = () => {
    if (!selectedSeason || !selectedEpisode) return
    const currentEpisodes = url.includes(vfUrl) ? episodes : engEpisodes
    if (selectedEpisode < currentEpisodes[selectedSeason]) {
      handleEpisodeSelect(selectedSeason, selectedEpisode + 1)
    } else if (selectedSeason < Object.keys(currentEpisodes).length) {
      handleEpisodeSelect(selectedSeason + 1, 1)
    }
  }

  const handlePreviousEpisode = () => {
    if (!selectedSeason || !selectedEpisode) return
    if (selectedEpisode > 1) {
      handleEpisodeSelect(selectedSeason, selectedEpisode - 1)
    } else if (selectedSeason > 1) {
      const prevSeason = selectedSeason - 1
      const prevEpisodeCount = url.includes(vfUrl)
        ? episodes[prevSeason]
        : engEpisodes[prevSeason]
      handleEpisodeSelect(prevSeason, prevEpisodeCount)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16 px-4">
          <div>
            <Button variant="ghost"  asChild>
              <a href="/" aria-label="Home">
              <div className="flex items-center space-x-2">
                <Icons.kebab className="h-6 w-6" aria-hidden="true" />
                <span className="inline-block font-bold">{siteConfig.name}</span>
                <span className="sr-only">Home</span>
              </div>
              </a>
            </Button>
          </div>
          {/* <h1 className="text-xl font-bold truncate">
            {modalStore.show?.title || modalStore.show?.name}
          </h1> */}
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
            <div className="relative h-[50vh] md:h-[60vh]">
              {isWatching ? (
                <EmbedPlayer url={url} />
              ) : (
                <>
                  {modalStore.show?.backdrop_path && (
                    <Image
                      src={`https://image.tmdb.org/t/p/original${modalStore.show.backdrop_path}`}
                      alt={modalStore.show.title || modalStore.show.name || 'Series backdrop'}
                      layout="fill"
                      objectFit="cover"
                      priority
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-shadow">
                      {modalStore.show?.title || modalStore.show?.name}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleVersionSelect('vo')}
                        className="bg-white text-black hover:bg-white/90"
                      >
                        <Play className="mr-2 h-4 w-4" /> Play Original
                      </Button>
                      {Object.keys(episodes).length > 0 && (
                        <Button
                          onClick={() => handleVersionSelect('vf')}
                          className="bg-white text-black hover:bg-white/90"
                        >
                          <Play className="mr-2 h-4 w-4" /> Play French
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex-grow flex flex-col">
              {isWatching ? (
                <div className="flex flex-col h-full">
                  <div className="flex justify-between p-4">
                    <Button
                      variant="outline"
                      onClick={handlePreviousEpisode}
                      disabled={selectedSeason === 1 && selectedEpisode === 1}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNextEpisode}
                      disabled={
                        selectedSeason === Object.keys(url.includes(vfUrl) ? episodes : engEpisodes).length &&
                        selectedEpisode === (url.includes(vfUrl) ? episodes : engEpisodes)[selectedSeason]
                      }
                    >
                      Next <ChevronRight className="ml-2 w-full max-w-4xl" />
                    </Button>
                  </div>
                  <ScrollArea className="flex-grow">
                    <div className="p-4">
                      <EpisodeSelector
                        seasons={url.includes(vfUrl) ? episodes : engEpisodes}
                        onSelect={handleEpisodeSelect}
                        langSelect={() => setIsWatching(false)}
                        showId={movieId}
                        vf={url.includes(vfUrl)}
                      />
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Star className="text-yellow-400" />
                    <span className="font-semibold">
                      {modalStore.show?.vote_average?.toFixed(1)} / 10
                    </span>
                    <span className="text-gray-400">
                      ({modalStore.show?.vote_count} votes)
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {modalStore.show?.first_air_date && `First aired: ${getYear(modalStore.show.first_air_date)}`}
                  </p>
                  <p className="text-sm md:text-base">{modalStore.show?.overview}</p>
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
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}