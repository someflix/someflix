'use client';

import { useEffect, useState, useRef } from 'react'
import { ShowWithGenreAndVideo } from '@/types'
import { getRecentlyWatched } from '@/utils/recentlyWatched'
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { cn, getNameFromShow, getSlug } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import CustomImage from './custom-image'
import { useModalStore } from '@/stores/modal'
import { MediaType } from '@/types'
import { useSearchStore } from '@/stores/search';
import Link from 'next/link'

export function RecentlyViewedMovies() {
  const [recentlyViewed, setRecentlyViewed] = useState<ShowWithGenreAndVideo[]>([])
  const showsRef = useRef<HTMLDivElement>(null)
  const [isScrollable, setIsScrollable] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    getRecentlyWatched().then(setRecentlyViewed)
  }, [])

  const scrollToDirection = (direction: 'left' | 'right') => {
    if (!showsRef.current) return;

    setIsScrollable(true);
    const { scrollLeft, offsetWidth } = showsRef.current;
    const handleSize = offsetWidth > 1400 ? 60 : 0.04 * offsetWidth;
    const offset =
      direction === 'left'
        ? scrollLeft - (offsetWidth - 2 * handleSize)
        : scrollLeft + (offsetWidth - 2 * handleSize);
    showsRef.current.scrollTo({ left: offset, behavior: 'smooth' });

    if (scrollLeft === 0 && direction === 'left') {
      showsRef.current.scrollTo({
        left: showsRef.current.scrollWidth,
        behavior: 'smooth',
      });
    } else if (
      scrollLeft + offsetWidth === showsRef.current.scrollWidth &&
      direction === 'right'
    ) {
      showsRef.current.scrollTo({
        left: 0,
        behavior: 'smooth',
      });
    }
  };

  if (recentlyViewed.length === 0) {
    return null
  }

  return (
    <section aria-label="Carousel of recently viewed shows" className="relative my-[3vw] p-0">
      <div className="space-y-1 sm:space-y-2.5">
        <h2 className="m-0 px-[4%] text-lg font-semibold text-foreground/80 transition-colors hover:text-foreground sm:text-xl 2xl:px-[60px]">
          Continue Watching
        </h2>
        <div className="relative w-full items-center justify-center overflow-hidden">
          <Button
            aria-label="Scroll to left"
            variant="ghost"
            className={cn(
              'absolute left-0 top-0 z-10 mr-2 hidden h-full w-[4%] items-center justify-center rounded-l-none bg-transparent py-0 text-transparent hover:bg-secondary/90 hover:text-foreground md:block 2xl:w-[60px]',
              isScrollable ? 'md:block' : 'md:hidden',
            )}
            onClick={() => scrollToDirection('left')}>
            <Icons.chevronLeft className="h-8 w-8" aria-hidden="true" />
          </Button>
          <div
            ref={showsRef}
            className="no-scrollbar m-0 grid auto-cols-[calc(100%/3)] grid-flow-col overflow-x-auto overflow-y-hidden px-[4%] py-0 duration-500 ease-in-out sm:auto-cols-[25%] md:touch-pan-y lg:auto-cols-[20%] xl:auto-cols-[calc(100%/6)] 2xl:px-[60px]">
            {recentlyViewed.map((show) => (
              <ShowCard key={show.id} show={show} pathname={pathname} />
            ))}
          </div>
          <Button
            aria-label="Scroll to right"
            variant="ghost"
            className="absolute right-0 top-0 z-10 m-0 ml-2 hidden h-full w-[4%] items-center justify-center rounded-r-none bg-transparent py-0 text-transparent hover:bg-secondary/70 hover:text-foreground md:block 2xl:w-[60px]"
            onClick={() => scrollToDirection('right')}>
            <Icons.chevronRight className="h-8 w-8" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  )
}

const ShowCard = ({ show, pathname }: { show: ShowWithGenreAndVideo; pathname: string }) => {
  const imageOnErrorHandler = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    event.currentTarget.src = '/images/grey-thumbnail.jpg';
  };

  const modalStore = useModalStore();
  const router = useRouter();

  const handleClick = () => {
    const mediaType = show.media_type === MediaType.TV ? 'tv' : 'movie';
    const watchPath = `/watch/${mediaType}/${show.id}`;

    // Update the URL without navigating
    window.history.pushState(null, '', watchPath);

    // Set the show in the modal store
    modalStore.setShow(show);
    modalStore.setOpen(true);
    modalStore.setPlay(false); // Set to false to ensure the modal opens

    // Use router.push for consistent navigation in both standalone and PC modes
    router.push(watchPath);
  };

  return (
    <picture className="relative aspect-[2/3]">
      <CustomImage
        src={
          show.poster_path ?? show.backdrop_path
            ? `https://image.tmdb.org/t/p/w500${
                show.poster_path ?? show.backdrop_path
              }`
            : '/images/grey-thumbnail.jpg'
        }
        alt={show.title ?? show.name ?? 'poster'}
        className="h-full w-full cursor-pointer rounded-lg px-1 transition-all md:hover:scale-110"
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 100vw, 33vw"
        style={{
          objectFit: 'cover',
        }}
        onClick={handleClick}
        onError={imageOnErrorHandler}
      />
    </picture>
  );
};