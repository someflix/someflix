'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useModalStore } from '@/stores/modal';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Play, Volume2, VolumeX } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Youtube from 'react-youtube';
import { getMobileDetect, getYear } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import { MediaType, type Genre, type ShowWithGenreAndVideo, type VideoResult } from '@/types';

type YouTubePlayer = {
  mute: () => void;
  unMute: () => void;
  playVideo: () => void;
  seekTo: (value: number) => void;
  container: HTMLDivElement;
  internalPlayer: YouTubePlayer;
};

type YouTubeEvent = {
  target: YouTubePlayer;
};

const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
const { isMobile } = getMobileDetect(userAgent);
const defaultOptions: Record<string, object> = {
  playerVars: {
    rel: 0,
    mute: isMobile() ? 1 : 0,
    loop: 1,
    autoplay: 1,
    controls: 0,
    showinfo: 0,
    disablekb: 1,
    enablejsapi: 1,
    playsinline: 1,
    cc_load_policy: 0,
    modestbranding: 3,
  },
};

const ShowModal: React.FC = () => {
  const modalStore = useModalStore();
  const IS_MOBILE: boolean = isMobile();

  const [trailer, setTrailer] = useState('');
  const [isPlaying, setPlaying] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(modalStore.firstLoad || IS_MOBILE);
  const [options, setOptions] = useState<Record<string, object>>(defaultOptions);

  const youtubeRef = useRef<Youtube>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (modalStore.firstLoad || IS_MOBILE) {
      setOptions((state) => ({
        ...state,
        playerVars: { ...state.playerVars, mute: 1 },
      }));
    }
    void handleGetData();
  }, [modalStore.show]);

  const handleGetData = async () => {
    if (!modalStore.show?.id) return;

    const type = modalStore.show.media_type === MediaType.TV ? 'tv' : 'movie';
    try {
      const data = await MovieService.findMovieByIdAndType(modalStore.show.id, type);
      if (data) {
        if (data.genres) {
          setGenres(data.genres);
        }
        if (data.videos?.results?.length) {
          const trailerVideo = data.videos.results.find((item: VideoResult) => item.type === 'Trailer');
          if (trailerVideo?.key) setTrailer(trailerVideo.key);
        }
      }
    } catch (error) {
      console.error('Error fetching show data:', error);
    }
  };

  const handleCloseModal = () => {
    modalStore.reset();
    if (!modalStore.show || modalStore.firstLoad) {
      window.history.pushState(null, '', '/');
    } else {
      window.history.back();
    }
  };

  const onEnd = (event: YouTubeEvent) => {
    event.target.seekTo(0);
  };

  const onPlay = () => {
    setPlaying(true);
    if (imageRef.current) {
      imageRef.current.style.opacity = '0';
    }
    if (youtubeRef.current) {
      const iframeRef = document.getElementById('video-trailer');
      if (iframeRef) iframeRef.classList.remove('opacity-0');
    }
  };

  const onReady = (event: YouTubeEvent) => {
    event.target.playVideo();
  };

  const handleChangeMute = () => {
    setIsMuted((state) => !state);
    if (!youtubeRef.current) return;
    const videoRef = youtubeRef.current as unknown as YouTubePlayer;
    if (isMuted && videoRef.internalPlayer) {
      videoRef.internalPlayer.unMute();
    } else if (videoRef.internalPlayer) {
      videoRef.internalPlayer.mute();
    }
  };

  return (
    <Dialog open={modalStore.open} onOpenChange={handleCloseModal}>
      <DialogContent className="w-full overflow-hidden rounded-md bg-zinc-900 p-0 text-left align-middle shadow-xl dark:bg-zinc-900 sm:max-w-1xl lg:max-w-2xl">
        <div className="video-wrapper relative aspect-video">
          <Image
            fill
            priority
            ref={imageRef}
            alt={modalStore.show?.title ?? 'poster'}
            className={`z-[1] h-auto w-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
            src={`https://image.tmdb.org/t/p/original${modalStore.show?.backdrop_path}`}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 100vw, 33vw"
          />
          {trailer && (
            <Youtube
              opts={options}
              onEnd={onEnd}
              onPlay={onPlay}
              ref={youtubeRef}
              onReady={onReady}
              videoId={trailer}
              id="video-trailer"
              title={modalStore.show?.title ?? modalStore.show?.name ?? 'video-trailer'}
              className="absolute inset-0 h-full w-full"
              iframeClassName={`absolute inset-0 w-full h-full pointer-events-none ${isPlaying ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            />
          )}
          <div className="absolute top-4 right-4 z-20">
          </div>
          <div className="absolute bottom-6 z-20 flex w-full items-center justify-between gap-2 px-10">
            <div className="flex items-center gap-2.5">
              <Link
                href={`/watch/${
                  modalStore.show?.media_type === MediaType.MOVIE ? 'movie' : 'tv'
                }/${modalStore.show?.id}`}
              >
                <Button
                  aria-label="Play Original"
                  className="group h-auto rounded py-1 px-2 text-xs sm:py-1.5 sm:px-3 sm:text-sm"
                >
                  <Play className="mr-1.5 h-5 w-5 sm:h-5 sm:w-5 fill-current" aria-hidden="true" />
                  Original
                </Button>
              </Link>
              <Link
                href={`/watch/${
                  modalStore.show?.media_type === MediaType.MOVIE ? 'movie' : 'tv'
                }/${modalStore.show?.id}?version=french`}
              >
                <Button
                  aria-label="Play French"
                  className="group h-auto rounded py-1 px-2 text-xs sm:py-1.5 sm:px-3 sm:text-sm"
                >
                  <Play className="mr-1.5 h-5 w-5 sm:h-5 sm:w-5 fill-current" aria-hidden="true" />
                  French
                </Button>
              </Link>
            </div>
            <Button
              aria-label={`${isMuted ? 'Unmute' : 'Mute'} video`}
              variant="ghost"
              className="h-auto rounded-full bg-neutral-800 p-1.5 opacity-50 ring-1 ring-slate-400 hover:bg-neutral-800 hover:opacity-100 hover:ring-white focus:ring-offset-0 dark:bg-neutral-800 dark:hover:bg-neutral-800"
              onClick={handleChangeMute}
            >
              {isMuted ? (
                <VolumeX className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Volume2 className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
        <div className="grid gap-2.5 px-10 pb-10">
          <DialogTitle className="text-lg font-medium leading-6 text-slate-50 sm:text-xl">
            {modalStore.show?.title ?? modalStore.show?.name}
          </DialogTitle>
          <div className="flex items-center space-x-2 text-sm sm:text-base">
            <p className="font-semibold text-green-400">
              {Math.round((Number(modalStore.show?.vote_average) / 10) * 100) ?? '-'}% Match
            </p>
            {modalStore.show?.release_date ? (
              <p>{getYear(modalStore.show?.release_date)}</p>
            ) : modalStore.show?.first_air_date ? (
              <p>{getYear(modalStore.show?.first_air_date)}</p>
            ) : null}
            {modalStore.show?.original_language && (
              <span className="grid h-4 w-7 place-items-center text-xs font-bold text-neutral-400 ring-1 ring-neutral-400">
                {modalStore.show.original_language.toUpperCase()}
              </span>
            )}
          </div>
          <DialogDescription className="line-clamp-3 text-xs text-slate-50 dark:text-slate-50 sm:text-sm">
            {modalStore.show?.overview ?? '-'}
          </DialogDescription>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-400">Genres:</span>
            {genres.map((genre) => genre.name).join(', ')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShowModal;