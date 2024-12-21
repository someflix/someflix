import { Event } from '../types'
import { formatDate } from '../utils/formatDate'
import { getRandomWallpaper } from '../utils/wallpapers'
import { Star } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'

interface EventCardProps {
  event: Event
  onClick: () => void
  popular: boolean;
}

interface SportDBEvent {
  strThumb: string | null
  strSquare: string | null
  strHomeTeamBadge: string
  strAwayTeamBadge: string
  strLeagueBadge: string
}

function getCurrentSeason(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // JavaScript months are 0-indexed

  if (month >= 8) { // If it's August or later
    return `${year}-${year + 1}`
  } else {
    return `${year - 1}-${year}`
  }
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const [sportDBEvent, setSportDBEvent] = useState<SportDBEvent | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const formattedDate = formatDate(event.date, event.category)
  const isLive = event.date === 0 || (
    event.category.toLowerCase() === 'football' && 
    Date.now() - event.date > 0 && 
    Date.now() - event.date <= 2 * 60 * 60 * 1000
  )
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Sport Events'
  const isFootball = event.category.toLowerCase() === 'football'

  useEffect(() => {
    async function fetchSportDBEvent() {
      if (isFootball && !event.poster) {
        setIsLoading(true)
        try {
          const season = getCurrentSeason()
          const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${event.title.replace(' ', '_')}&s=${season}`)
          const data = await response.json()
          if (data.event && data.event[0]) {
            setSportDBEvent(data.event[0])
          }
        } catch (error) {
          console.error('Error fetching SportDB event:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchSportDBEvent()
  }, [event, isFootball])

  const getImageSrc = () => {
    if (event.poster) {
      return `https://corsproxy.io/?url=https://streamed.su${event.poster}`
    }
    if (isFootball && sportDBEvent) {
      if (sportDBEvent.strThumb) return sportDBEvent.strThumb;
      if (sportDBEvent.strSquare) return sportDBEvent.strSquare;
      // Construct thumbnail URL with badges if strThumb and strSquare are null
      return `/football-thumbnail.svg?homeBadge=${encodeURIComponent(sportDBEvent.strHomeTeamBadge)}&awayBadge=${encodeURIComponent(sportDBEvent.strAwayTeamBadge)}&leagueBadge=${encodeURIComponent(sportDBEvent.strLeagueBadge)}`;
    }
    // If no poster or SportDB image, use a random wallpaper
    return getRandomWallpaper(event.category)
  }

  const imageSrc = useMemo(() => getImageSrc(), [event, sportDBEvent, isFootball]);

  return (
    <div 
      className="relative overflow-hidden rounded-xl cursor-pointer"
      onClick={onClick}
    >
      <div className="relative bg-gray-800 h-[160px] overflow-hidden group rounded-2xl">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={event.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-400 animate-gradient-xy">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Image
                  src="/favicon.ico"
                  alt="Site Logo"
                  width={48}
                  height={48}
                  className="mx-auto mb-2 "
                />
                <span className="text-white font-medium text-sm">{siteName}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-3">
          {/* Top row with live/time badge and star */}
          <div className="flex justify-between items-start">
            <span className={`text-white text-xs font-medium px-3 py-1 rounded-full ${isLive ? 'bg-[#dc2626]' : 'bg-gray-800/80'}`}>
              {formattedDate}
            </span>
            {event.popular && (
              <span className="bg-yellow-600 rounded-full p-1">
                <Star className="w-4 h-4 text-white" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Event title */}
      <div className="p-3 bg-black/90">
        <h3 className="text-white font-medium text-sm line-clamp-2">
          {event.title}
        </h3>
      </div>
    </div>
  )
}

