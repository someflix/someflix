'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Star, Play } from 'lucide-react'
import EventCarousel from '@/components/EventCarousel'
import SourceSelector from '@/components/SourceSelector'
import { EventInfo } from '@/components/EventInfo'
import { formatDate } from '@/utils/formatDate'
import HeroSlider from '@/components/HeroSlider'
import { isTopClub, getTopClubPriority } from '@/utils/topFootballClubs'
import { TVChannelCard } from '@/components/TVChannelCard'

interface Channel {
  title: string
  imageUrl: string
  playerUrl: string
}

interface Event {
  id: string
  title: string
  category: string
  date: number
  popular: boolean
  teams?: {
    home: Team
    away: Team
  }
  sources: Source[]
  poster?: string
}

interface Team {
  name: string
  badge?: string
}

interface Source {
  source: string
  id: string
}

const priorityOrder = ['football', 'fight', 'tennis', 'basketball'];

function sortCategories(a: string, b: string): number {
  const aIndex = priorityOrder.indexOf(a);
  const bIndex = priorityOrder.indexOf(b);
  
  if (aIndex !== -1 && bIndex !== -1) {
    return aIndex - bIndex;
  } else if (aIndex !== -1) {
    return -1;
  } else if (bIndex !== -1) {
    return 1;
  } else {
    return a.localeCompare(b);
  }
}

async function fetchChannels(): Promise<Channel[]> {
  const response = await fetch('/api/channels')
  if (!response.ok) {
    const text = await response.text()
    if (text.startsWith('<!DOCTYPE html>')) {
      throw new Error('Received HTML instead of JSON. The server might be down or redirecting.')
    }
    throw new Error(`Failed to fetch channels: ${response.statusText}`)
  }
  return response.json()
}

async function fetchEvents(): Promise<Event[]> {
  const response = await fetch('https://corsproxy.io/?url=https://streamed.su/api/matches/all')
  if (!response.ok) {
    throw new Error('Failed to fetch events')
  }
  const data = await response.json()

  const now = Date.now()
  return data
    .filter((event: Event) => {
      if (event.category.toLowerCase() === 'football') {
        if (!event.poster) return false
        return now <= event.date + 2 * 60 * 60 * 1000 // Include events up to 2 hours after start
      }
      if (event.category.toLocaleLowerCase() === 'other' || event.category.toLocaleLowerCase() === 'cricket' || event.category.toLocaleLowerCase() === 'golf')
        return false
      return event.date >= now - 30 * 60 * 1000 // For non-football events, include from 30 minutes before
    })
    .sort((a: Event, b: Event) => {
      if (isEventLive(a.date, a.category) && !isEventLive(b.date, b.category)) return -1
      if (!isEventLive(a.date, a.category) && isEventLive(b.date, b.category)) return 1
      return a.date - b.date
    })
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

async function checkSportsDBThumb(event: Event): Promise<string | null> {
  if (event.category.toLowerCase() !== 'football') return null;
  
  try {
    const season = getCurrentSeason()
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${event.title.replace(' ', '_')}&s=${season}`
    )
    if (!response.ok) return null;
    
    const data = await response.json()
    return data.event?.[0]?.strThumb || null
  } catch (error) {
    console.error('Error fetching sports DB thumb:', error)
    return null
  }
}

function isEventLive(eventDate: number, category: string): boolean {
  const now = Date.now()
  const thirtyMinutesBefore = eventDate - 30 * 60 * 1000
  const twoHoursAfter = eventDate + 2 * 60 * 60 * 1000
  
  if (category.toLowerCase() === 'football') {
    return now >= eventDate && now <= twoHoursAfter
  }
  
  const sportDuration = category.toLowerCase() === 'tennis' ? 2 * 60 * 60 * 1000 : 3 * 60 * 60 * 1000
  return now >= thirtyMinutesBefore && now <= eventDate + sportDuration
}

export default function Component() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [heroEvents, setHeroEvents] = useState<Event[]>([])
  const [activeTab, setActiveTab] = useState("sports")

  const visibleChannels = channels.filter(channel => channel.title !== selectedChannel?.title)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [channelsData, eventsData] = await Promise.all([fetchChannels(), fetchEvents()])
        setChannels(channelsData)
        setEvents(eventsData)
        
        // Select hero events
        const footballEvents = eventsData.filter(event => 
          event.category.toLowerCase() === 'football' &&
          isTopClub(event.title)
        )

        // Sort football events by popularity and then by top club priority
        const sortedFootballEvents = footballEvents.sort((a, b) => {
          if (a.popular && !b.popular) return -1
          if (!a.popular && b.popular) return 1
          return getTopClubPriority(a.title) - getTopClubPriority(b.title)
        })

        const heroEvents = sortedFootballEvents.slice(0, 5)

        if (heroEvents.length === 0 && eventsData.length > 0) {
          heroEvents.push(eventsData[0])
        }

        setHeroEvents(heroEvents)
        
        setIsLoading(false)
      } catch (err) {
        console.error('Error loading data:', err)
        setError(err instanceof Error ? err : new Error('An unexpected error occurred'))
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (selectedChannel && dialogRef.current) {
      dialogRef.current.scrollTop = dialogRef.current.scrollTop = 0
    }
  }, [selectedChannel])


  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.category]) {
      acc[event.category] = []
    }
    acc[event.category].push(event)
    return acc
  }, {} as Record<string, Event[]>)

  const sortedCategories = Object.keys(groupedEvents).sort(sortCategories)

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    if (isEventLive(event.date, event.category)) {
      setSelectedSource(event.sources[0])
    } else {
      setSelectedSource(null)
    }
  }

  const handleSourceSelect = (source: Source) => {
    setSelectedSource(source)
  }

  const handleCloseDialog = () => {
    setSelectedEvent(null)
    setSelectedSource(null)
  }


  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load data: {error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-[400px] w-full mb-8" />
        <Skeleton className="h-10 w-48 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero slider */}
      <HeroSlider events={heroEvents} onEventClick={handleEventClick} />

      {/* Fixed position tabs at top */}
      <div className="z-30 mx-auto px-4 py-2 my-5 mt-10 bg-transparent w-screen">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sports" className="text-sm bg-transparent">Sport Events</TabsTrigger>
            <TabsTrigger value="tv" className="text-sm bg-transparent">TV Channels</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main content */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="sports">
            {sortedCategories.map((category) => (
              <EventCarousel 
                key={category} 
                category={category} 
                events={groupedEvents[category]} 
                onEventClick={handleEventClick}
              />
            ))}
          </TabsContent>
          <TabsContent value="tv">
            <h2 className="text-2xl font-semibold mb-6 text-white">TV Channels</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {channels.map((channel) => (
                <TVChannelCard
                  key={channel.title}
                  title={channel.title}
                  imageUrl={channel.imageUrl}
                  onClick={() => setSelectedChannel(channel)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedChannel} onOpenChange={() => setSelectedChannel(null)}>
        <DialogContent className="max-w-[90vw] w-full h-[90vh] flex flex-col" ref={dialogRef}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{selectedChannel?.title}</DialogTitle>
          </DialogHeader>
          {selectedChannel && (
            <>
              <div className="flex-grow h-[75vh]">
                <iframe
                  src={selectedChannel.playerUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedEvent} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-5xl w-full h-[90vh] p-0 bg-gray-900">
          {selectedEvent && (
            <div className="flex flex-col h-full">
              {isEventLive(selectedEvent.date, selectedEvent.category) ? (
                <>
                  <div className="p-4 bg-gray-800">
                    <h2 className="text-xl font-bold mb-2 text-white">{selectedEvent.title}</h2>
                    <SourceSelector 
                      sources={selectedEvent.sources} 
                      selectedSource={selectedSource}
                      onSelect={handleSourceSelect}
                    />
                  </div>
                  {selectedSource && (
                    <div className="flex-grow">
                      <iframe 
                        src={`https://embedme.top/embed/${selectedSource.source}/${selectedSource.id}/1`}
                        className="w-full h-full"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-forms"
                        title={`${selectedEvent.title} - ${selectedSource.source}`}
                      />
                    </div>
                  )}
                </>
              ) : (
                <EventInfo event={selectedEvent} />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

