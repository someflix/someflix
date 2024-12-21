import { Event } from '../types'
import { formatDate } from '../utils/formatDate'
import { getRandomWallpaper } from '../utils/wallpapers'
import Image from 'next/image'
import { useMemo } from 'react'

interface EventInfoProps {
  event: Event
}

export function EventInfo({ event }: EventInfoProps) {
  const now = Date.now()
  const timeDiff = now - event.date
  const isFootball = event.category.toLowerCase() === 'football'
  const isTennis = event.category.toLowerCase() === 'tennis'

  let status: 'upcoming' | 'live' | 'ended'
  let statusText: string

  if (event.date > now) {
    status = 'upcoming'
    statusText = `Starts ${formatDate(event.date, event.category)}`
  } else if (isFootball && timeDiff <= 2 * 60 * 60 * 1000) {
    status = 'live'
    statusText = `${Math.floor(timeDiff / 60000)}' Live`
  } else if (isTennis && timeDiff <= 2 * 60 * 60 * 1000) {
    status = 'live'
    statusText = `${Math.floor(timeDiff / 60000)}' Live`
  } else if (!isFootball && !isTennis && timeDiff <= 3 * 60 * 60 * 1000) {
    status = 'live'
    statusText = `${Math.floor(timeDiff / 60000)}' Live`
  } else {
    status = 'ended'
    statusText = 'Event has ended'
  }

  const imageSrc = useMemo(() => {
    if (event.poster) {
      return `https://corsproxy.io/?url=https://streamed.su${event.poster}`
    }
    return getRandomWallpaper(event.category)
  }, [event.poster, event.category])

  return (
    <div className="flex flex-col items-center p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">{event.title}</h2>
      <div className="relative w-full h-64 mb-4">
        <Image
          src={imageSrc}
          alt={event.title}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>
      <div className="text-center mb-4">
        <p className="text-lg font-semibold text-white">{formatDate(event.date, event.category)}</p>
        {event.teams && (
          <p className="text-md text-gray-300">
            {event.teams.home.name} vs {event.teams.away.name}
          </p>
        )}
      </div>
      <div className={`text-lg font-semibold ${
        status === 'live' ? 'text-green-400' :
        status === 'upcoming' ? 'text-yellow-400' : 'text-gray-400'
      }`}>
        {statusText}
      </div>
      {status === 'upcoming' && (
        <p className="mt-4 text-center text-gray-300">
          The live stream will begin 30 minutes before the event starts.
        </p>
      )}
      {status === 'ended' && (
        <p className="mt-4 text-center text-gray-300">
          Thank you for watching! Check out other live or upcoming events.
        </p>
      )}
    </div>
  )
}

