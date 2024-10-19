'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import EmbedPlayer from '@/components/watch/embed-player';
import { FaArrowLeft } from 'react-icons/fa';
import { getIdFromSlug, getMobileDetect, getYear } from '@/lib/utils';
import MovieService from '@/services/MovieService';
import { useModalStore } from '@/stores/modal';
import { Show, Genre, MediaType, ShowWithGenreAndVideo, VideoResult } from '@/types';
import { AxiosResponse } from 'axios';
import { usePathname } from 'next/navigation';


export default function MovieVersionSelector({ vfUrl, voUrl, vfAvailable }: { vfUrl: string, voUrl: string, vfAvailable: boolean }) {
    const [url, setUrl] = useState(voUrl);
    const [selectLang, setSelectLang] = useState(true);
    const [seeMovie, setSeeMovie] = useState(false);

    //###################################################
    const pathname = usePathname();

    // stores
    const modalStore = useModalStore();
    React.useEffect(() => {
        void handleOpenModal();
      }, []);
    
      const handleOpenModal = async (): Promise<void> => {
        // if (!/\d/.test(pathname) || modalStore.open) {
        //   return;
        // }
        const movieId: number = parseInt(pathname.split('/').pop()) ;
        console.log(movieId);
        if (!movieId) {
          return;
        }
        try {
          const response: AxiosResponse<Show> =  await MovieService.findMovie(movieId);
          const data: Show = response.data;
          console.log(data);
          if (data)
            useModalStore.setState({
              show: data,
              open: true,
              play: true,
              firstLoad: true,
            });
        } catch (error) {console.log(error)}
      };
    const userAgent =
        typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
    const { isMobile } = getMobileDetect(userAgent);
    const defaultOptions: Record<string, object> = {
    playerVars: {
        // https://developers.google.com/youtube/player_parameters
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
    const IS_MOBILE: boolean = isMobile();
  
    const [trailer, setTrailer] = React.useState('');
    const [isPlaying, setPlaying] = React.useState(true);
    const [genres, setGenres] = React.useState<Genre[]>([]);
    const [isMuted, setIsMuted] = React.useState<boolean>(
      modalStore.firstLoad || IS_MOBILE,
    );
    const [options, setOptions] =
      React.useState<Record<string, object>>(defaultOptions);
  
    const youtubeRef = React.useRef(null);
    const imageRef = React.useRef<HTMLImageElement>(null);
  
    // get trailer and genres of show
    React.useEffect(() => {
      if (modalStore.firstLoad || IS_MOBILE) {
        setOptions((state: Record<string, object>) => ({
          ...state,
          playerVars: { ...state.playerVars, mute: 1 },
        }));
      }
      void handleGetData();
    }, []);
  
    const handleGetData = async () => {
      const id: number | undefined = modalStore.show?.id;
      const type: string =
        modalStore.show?.media_type === MediaType.TV ? 'tv' : 'movie';
      if (!id || !type) {
        return;
      }
      const data: ShowWithGenreAndVideo = await MovieService.findMovieByIdAndType(
        id,
        type,
      );
      if (data?.genres) {
        setGenres(data.genres);
      }
      if (data.videos?.results?.length) {
        const videoData: VideoResult[] = data.videos?.results;
        const result: VideoResult | undefined = videoData.find(
          (item: VideoResult) => item.type === 'Trailer',
        );
        if (result?.key) setTrailer(result.key);
      }
    };
    //###################################################

    return (
        <div style={{ width: '100vw', height: '100vh', backgroundImage:`url(https://image.tmdb.org/t/p/original${modalStore.show?.backdrop_path})`, backgroundSize:"cover" }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', maxHeight: '10vh', height: '10vh', width: '100vw', position: 'fixed', top:'O%' }} className={`gap-10 z-100 ${seeMovie ? 'bg-black' : 'bg-gradient-to-r from-black to-transparent'}`}>
                <Button
                    aria-label="VF"
                    variant='link'
                    className=" rounded-xl h-auto w-auto py-3 my-5 ml-10 absolute"
                    // onClick={() => { router.replace('/') }}
                >
                    <a href='/'><div className="flex items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin='round' className="h-6 w-6" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span className="inline-block font-bold">{process.env.NEXT_PUBLIC_SITE_NAME}</span><span className="sr-only">Home</span></div></a>
                </Button>
                <div className='flex justify-evenly w-screen'>
                    
                    <p className="text-xl font-large leading-9 text-slate-50 sm:text-xl self-center">
                        {modalStore.show?.title ?? modalStore.show?.name}
                        
                    </p>
                    
                </div>
            </div>    
            {selectLang && (
                <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', height: '70%' }} className='bg-gradient-to-t from-neutral-900/25 to-transparent'>
                        <Button
                            aria-label="VO"
                            variant="outline"
                            className="h-auto flex-shrink-0 gap-2 rounded-xl w-1/4 mr-2.5 my-auto py-6"
                            onClick={() => { setUrl(voUrl); setSeeMovie(true); setSelectLang(false); }}
                        >
                            Original Version
                        </Button>
                        {vfAvailable && (
                            <Button
                                aria-label="VF"
                                variant="outline"
                                className="h-auto flex-shrink-0 gap-2 rounded-xl w-1/4 ml-2.5 my-auto py-6"
                                onClick={() => { setUrl(vfUrl); setSelectLang(false); setSeeMovie(true); }}
                            >
                                French Version
                            </Button>
                        )}

                    </div>
                    <div className="grid gap-2.5 pt-10 pb-10 pl-40 bg-gradient-to-t from-black to-neutral-900/50" style={{height: '30%'}}>
                        <h4 className="text-lg font-medium leading-6 text-slate-50 sm:text-xl">
                        {modalStore.show?.title ?? modalStore.show?.name}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm sm:text-base">
                        <p className="font-semibold text-green-400">
                            {Math.round((Number(modalStore.show?.vote_average) / 10) * 100) ??
                            '-'}
                            % Match
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
                        <p className="line-clamp-3 text-xs text-slate-50 dark:text-slate-50 sm:text-sm">
                        {modalStore.show?.overview ?? '-'}
                        </p>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="text-slate-400">Genres:</span>
                        {genres.map((genre) => genre.name).join(', ')}
                        </div>
                    </div>
                </div>
            )}
            {seeMovie && (
                <EmbedPlayer url={url} />
            )}
        </div>
    );
}
