'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface Channel {
  title: string
  imageUrl: string
  playerUrl: string
}

async function fetchChannels(): Promise<Channel[]> {
  const response = await fetch('/api/channels')
  if (!response.ok) {
    throw new Error('Failed to fetch channels')
  }
  return response.json()
}

export default function Component() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const dialogRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const visibleChannels = channels.filter(channel => channel.title !== selectedChannel?.title)

  useEffect(() => {
    const loadChannels = async () => {
      try {
        const data = await fetchChannels()
        setChannels(data)
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
        setIsLoading(false)
      }
    }

    loadChannels()
  }, [])

  useEffect(() => {
    if (selectedChannel && dialogRef.current) {
      dialogRef.current.scrollTop = 0
    }
  }, [selectedChannel])

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prevIndex) => (prevIndex + 1) % Math.ceil(visibleChannels.length / 6))
    }, 3000)

    return () => clearInterval(interval)
  }, [visibleChannels.length])

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-destructive">Failed to load channels: {error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">TV Channels</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (channels.length === 0) {
    return (
      <div>
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-8">
          <motion.div 
            className="w-full md:w-1/2 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              Live TV Shows <br />
              <span className="text-blue-500">Coming Soon</span>
            </h2>
            <p className="text-xl text-gray-300">
              Get ready for an immersive live TV experience. Stay tuned and be the first to know when we launch!
            </p>
          </motion.div>

          <motion.div 
            className="w-full md:w-1/2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="https://media.istockphoto.com/id/1336906460/photo/media-concept-multiple-television-screens.jpg?s=612x612&w=0&k=20&c=UADwGBrVEBLSVirl7wWvliVXjXC_j112Qwerm-cDKyY="
              alt="Live TV Shows Coming Soon"
              width={600}
              height={400}
              className="rounded-lg shadow-2xl"
            />
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">TV Channels</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {channels.map((channel) => (
          <Card 
            key={channel.title}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedChannel(channel)}
          >
            <CardContent className="p-4">
              <div className="aspect-video relative mb-4">
                <img
                  src={channel.imageUrl}
                  alt={channel.title}
                  className="object-contain w-full h-full"
                />
              </div>
              <h2 className="font-medium text-center">{channel.title}</h2>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedChannel} onOpenChange={() => setSelectedChannel(null)}>
        <DialogContent className="max-w-[90vw] w-full h-[90vh] flex flex-col" ref={dialogRef}>
          <DialogHeader>
            <DialogTitle>{selectedChannel?.title}</DialogTitle>
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
              <div className="mt-4 h-[15vh]">
                <h3 className="text-lg font-semibold mb-2">Other Channels</h3>
                <div className="relative h-full overflow-hidden">
                  <div 
                    ref={carouselRef}
                    className="flex transition-transform duration-300 ease-in-out h-full"
                    style={{ transform: `translateX(-${carouselIndex * (100/6)}%)` }}
                  >
                    {visibleChannels.map((channel, index) => (
                      <div
                        key={channel.title}
                        className="w-1/6 flex-shrink-0 px-4 h-5/6"
                      >
                        <Card
                          className="cursor-pointer hover:shadow-lg transition-shadow h-full"
                          onClick={() => setSelectedChannel(channel)}
                        >
                          <CardContent className="p-2 flex flex-col items-center justify-center h-full">
                            <div className="w-full aspect-video relative mb-2">
                              <img
                                src={channel.imageUrl}
                                alt={channel.title}
                                className="object-contain w-full h-full"
                              />
                            </div>
                            <h2 className="font-medium text-center text-sm truncate w-full">{channel.title}</h2>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-1/2 left-2 -translate-y-1/2"
                    onClick={() => setCarouselIndex((prevIndex) => (prevIndex - 1 + Math.ceil(visibleChannels.length / 6)) % Math.ceil(visibleChannels.length / 6))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-1/2 right-2 -translate-y-1/2"
                    onClick={() => setCarouselIndex((prevIndex) => (prevIndex + 1) % Math.ceil(visibleChannels.length / 6))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}