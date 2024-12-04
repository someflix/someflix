import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Star, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { Event } from '../types'
import { formatDate } from '../utils/formatDate'
import { Icons } from './icons'

interface HeroSliderProps {
  events: Event[]
  onEventClick: (event: Event) => void
}

interface EventWithThumb extends Event {
  strThumb?: string | null
}

function getCurrentSeason(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  if (month >= 8) {
    return `${year}-${year + 1}`
  } else {
    return `${year - 1}-${year}`
  }
}

export default function HeroSlider({ events, onEventClick }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [eventsWithThumbs, setEventsWithThumbs] = useState<EventWithThumb[]>([])

  useEffect(() => {
    const fetchThumbs = async () => {
      const updatedEvents = await Promise.all(events.map(async (event) => {
        if (event.category.toLowerCase() === 'football') {
          try {
            const season = getCurrentSeason()
            const response = await fetch(
              `https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${event.title.replace(' ', '_')}&s=${season}`
            )
            if (!response.ok) return event;
            const data = await response.json()
            const strThumb = data.event?.[0]?.strThumb || null
            return { ...event, strThumb }
          } catch (error) {
            console.error('Error fetching sports DB thumb:', error)
            return event
          }
        }
        return event
      }))
      setEventsWithThumbs(updatedEvents)
    }

    fetchThumbs()
  }, [events])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % eventsWithThumbs.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(timer)
  }, [eventsWithThumbs.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + eventsWithThumbs.length) % eventsWithThumbs.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % eventsWithThumbs.length)
  }

  if (eventsWithThumbs.length === 0) return null

  const currentEvent = eventsWithThumbs[currentIndex]
  const imageSrc = currentEvent.strThumb || (currentEvent.poster ? `https://streamed.su${currentEvent.poster}` : '/placeholder.svg?height=1080&width=1920')

  return (
    <section aria-label="Hero" className="relative w-full h-[80vh]">
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={currentEvent.title}
          layout="fill"
          objectFit="cover"
          priority
          className="transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 p-6 max-w-4xl z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentEvent.date === 0 ? 'bg-red-600' : 'bg-black/50'
          }`}>
            {formatDate(currentEvent.date, currentEvent.category)}
          </span>
          {currentEvent.popular && (
            <span className="bg-yellow-600 rounded-full p-1">
              <Star className="w-4 h-4" />
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold mb-2 text-white">{currentEvent.title}</h1>
        <p className="text-lg text-gray-200 mb-4">{currentEvent.category}</p>
        <Button 
          onClick={() => onEventClick(currentEvent)}
          className="bg-primary hover:bg-primary/90"
          size="lg"
        >
            <Icons.play className="fill-current mr-2" aria-hidden="true" />
            Watch Now
        </Button>
      </div>
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <Button variant="outline" size="icon" onClick={goToPrevious} className="rounded-full bg-black/50 hover:bg-black/70">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={goToNext} className="rounded-full bg-black/50 hover:bg-black/70">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {eventsWithThumbs.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </section>
  )
}

