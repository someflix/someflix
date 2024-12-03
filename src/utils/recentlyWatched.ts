import { ShowWithGenreAndVideo } from '@/types'
import MovieService from '@/services/MovieService'

const MAX_RECENTLY_WATCHED = 10

export function addToRecentlyWatched(slug: string) {
  if (typeof window === 'undefined') return // Guard for server-side rendering

  const [, mediaType, id] = slug.split('/')
  if (mediaType !== 'movie' && mediaType !== 'tv') return

  let recentlyWatched: string[] = JSON.parse(localStorage.getItem('recentlyWatched') || '[]')
  
  // Remove the item if it's already in the list
  recentlyWatched = recentlyWatched.filter(item => item !== slug)
  
  // Add the new item to the beginning of the list
  recentlyWatched.unshift(slug)
  
  // Keep only the last MAX_RECENTLY_WATCHED items
  recentlyWatched = recentlyWatched.slice(0, MAX_RECENTLY_WATCHED)
  
  localStorage.setItem('recentlyWatched', JSON.stringify(recentlyWatched))
}

export async function getRecentlyWatched(): Promise<ShowWithGenreAndVideo[]> {
  if (typeof window === 'undefined') return [] // Guard for server-side rendering

  const recentlyWatched: string[] = JSON.parse(localStorage.getItem('recentlyWatched') || '[]')
  
  // Fetch details for each item
  const shows = await Promise.all(recentlyWatched.map(async (slug) => {
    const [, mediaType, idString] = slug.split('/')
    const id = parseInt(idString, 10)
    if (isNaN(id)) return null
    return await MovieService.findMovieByIdAndType(id, mediaType)
  }))

  return shows.filter((show): show is ShowWithGenreAndVideo => show !== null)
}