import { useRef, useState, useEffect } from 'react'
import { Event } from '../types'
import EventCard from './EventCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface EventCarouselProps {
  category: string
  events: Event[]
  onEventClick: (event: Event) => void
}

export default function EventCarousel({ category, events, onEventClick }: EventCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setIsAtStart(scrollLeft === 0);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
      setTimeout(checkScrollPosition, 300); // Check position after scroll animation
    }
  }

  return (
    <div className="mb-12"> {/* Increased bottom margin */}
      <div className="flex items-center justify-between mb-4"> {/* Increased bottom margin */}
        <h2 className="text-2xl md:text-3xl font-bold capitalize text-white">{category}</h2> {/* Increased font size and weight */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="hidden md:flex rounded-full"
            disabled={isAtStart}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="hidden md:flex rounded-full"
            disabled={isAtEnd}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        >
          {events.map((event) => (
            <div key={event.id} className="w-[280px] md:w-[300px] flex-shrink-0">
              <EventCard event={event} onClick={() => onEventClick(event)} popular={event.popular} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

