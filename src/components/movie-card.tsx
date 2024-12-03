'use client'

import { Card, CardContent } from "@/components/ui/card"
import Image from 'next/image'
import Link from 'next/link'
import { Show } from '@/types'
import { useCallback } from 'react'

interface MovieCardProps {
  movie: Show
}

export function MovieCard({ movie }: MovieCardProps) {
  const addToRecentlyViewed = useCallback(() => {
    const storedMovies = localStorage.getItem('recentlyViewedMovies')
    let recentlyViewed = storedMovies ? JSON.parse(storedMovies) : []
    
    // Remove the movie if it's already in the list
    recentlyViewed = recentlyViewed.filter((m: Show) => m.id !== movie.id)
    
    // Add the movie to the beginning of the list
    recentlyViewed.unshift(movie)
    
    // Keep only the last 10 movies
    recentlyViewed = recentlyViewed.slice(0, 10)
    
    localStorage.setItem('recentlyViewedMovies', JSON.stringify(recentlyViewed))
  }, [movie])

  return (
    <Card className="w-[250px] shrink-0">
      <CardContent className="p-0">
        <Link href={`/movie/${movie.id}`} onClick={addToRecentlyViewed}>
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title || 'Movie poster'}
            width={250}
            height={375}
            className="object-cover rounded-t-md"
          />
          <div className="p-4">
            <h3 className="font-bold truncate">{movie.title || 'Untitled'}</h3>
            <p className="text-sm text-gray-500 truncate">{movie.release_date || 'Release date unknown'}</p>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}