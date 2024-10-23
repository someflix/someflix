// 'use client'

// import React, { useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import EmbedPlayer from '@/components/watch/embed-player';
// import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
// import EpisodeSelector from '@/components/watch/EpisodeSelector';
// import { getIdFromSlug, getMobileDetect, getYear } from '@/lib/utils';
// import MovieService from '@/services/MovieService';
// import { useModalStore } from '@/stores/modal';
// import { Show, Genre, MediaType, ShowWithGenreAndVideo, VideoResult } from '@/types';
// import { AxiosResponse } from 'axios';
// import { usePathname, useRouter } from 'next/navigation';
// import { Icons } from '../icons';


// export default function SeriesVersionSelector({ vfUrl, voUrl, episodes, engEpisodes }: { vfUrl: string, voUrl: string, episodes: any, engEpisodes: any}) {
//     const [url, setUrl] = useState(voUrl);
//     const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
//     const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
//     const [selectLang, setSelectLang] = useState(true);
//     const [selectEpi, setSelectEpi] = useState(false);
//     const [seeMovie, setSeeMovie] = useState(false);

//     //###################################################
//     const pathname = usePathname();
//     const movieId: number = parseInt(pathname.split('/').pop());

//     // stores
//     const modalStore = useModalStore();
//     React.useEffect(() => {
//         void handleOpenModal();
//       }, []);
    
//       const handleOpenModal = async (): Promise<void> => {
//         if (!/\d/.test(pathname) || modalStore.open) {
//           return;
//         }
//         const movieId: number = parseInt(pathname.split('/').pop());
//         if (!movieId) {
//           return;
//         }
//         try {
//           const response: AxiosResponse<Show> = await MovieService.findTvSeries(movieId)
//           const data: Show = response.data;
//           if (data)
//             useModalStore.setState({
//               show: data,
//               open: true,
//               play: true,
//               firstLoad: true,
//             });
//         } catch (error) {}
//       };
//     const userAgent =
//         typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;
//     const { isMobile } = getMobileDetect(userAgent);
//     const defaultOptions: Record<string, object> = {
//     playerVars: {
//         // https://developers.google.com/youtube/player_parameters
//         rel: 0,
//         mute: isMobile() ? 1 : 0,
//         loop: 1,
//         autoplay: 1,
//         controls: 0,
//         showinfo: 0,
//         disablekb: 1,
//         enablejsapi: 1,
//         playsinline: 1,
//         cc_load_policy: 0,
//         modestbranding: 3,
//     },
//     };
//     const IS_MOBILE: boolean = isMobile();
  
//     const [trailer, setTrailer] = React.useState('');
//     const [isPlaying, setPlaying] = React.useState(true);
//     const [genres, setGenres] = React.useState<Genre[]>([]);
//     const [isMuted, setIsMuted] = React.useState<boolean>(
//       modalStore.firstLoad || IS_MOBILE,
//     );
//     const [options, setOptions] =
//       React.useState<Record<string, object>>(defaultOptions);
  
//     const youtubeRef = React.useRef(null);
//     const imageRef = React.useRef<HTMLImageElement>(null);
  
//     // get trailer and genres of show
//     React.useEffect(() => {
//       if (modalStore.firstLoad || IS_MOBILE) {
//         setOptions((state: Record<string, object>) => ({
//           ...state,
//           playerVars: { ...state.playerVars, mute: 1 },
//         }));
//       }
//       void handleGetData();
//     }, []);
  
//     const handleGetData = async () => {
//       const id: number | undefined = modalStore.show?.id;
//       const type: string =
//         modalStore.show?.media_type === MediaType.TV ? 'tv' : 'movie';
//       if (!id || !type) {
//         return;
//       }
//       const data: ShowWithGenreAndVideo = await MovieService.findMovieByIdAndType(
//         id,
//         type,
//       );
//       if (data?.genres) {
//         setGenres(data.genres);
//       }
//       if (data.videos?.results?.length) {
//         const videoData: VideoResult[] = data.videos?.results;
//         const result: VideoResult | undefined = videoData.find(
//           (item: VideoResult) => item.type === 'Trailer',
//         );
//         if (result?.key) setTrailer(result.key);
//       }
//     };
//     //###################################################


//     const handleNextEpisode = () => {
//         if(selectedEpisode != null && selectedSeason != null){
//             var season : number = 1;
//             var episode : number = 1;
//             if (url.includes(vfUrl)){
//               if (selectedEpisode < episodes[selectedSeason]) {
//                   setSelectedEpisode(selectedEpisode + 1);
//                   episode = selectedEpisode + 1;
//                   season = selectedSeason;
//               } else if (selectedSeason < Object.keys(episodes).length) {
//                   setSelectedSeason(selectedSeason + 1);
//                   setSelectedEpisode(1);
//                   season = selectedSeason + 1;
//                   episode = 1;
//               }
//             }
//             else if (url.includes(voUrl)){
//               if (selectedEpisode < engEpisodes[selectedSeason]) {
//                 setSelectedEpisode(selectedEpisode + 1);
//                 episode = selectedEpisode + 1;
//                 season = selectedSeason;
//               } else if (selectedSeason < Object.keys(engEpisodes).length) {
//                 setSelectedSeason(selectedSeason + 1);
//                 setSelectedEpisode(1);
//                 season = selectedSeason + 1;
//                 episode = 1;
//               }
//             }
//             return {season, episode}
//         }
//       };
    
//       const handlePreviousEpisode = () => {
//         var season : number = 1;
//         var episode : number = 1;
//         if(selectedEpisode != null && selectedSeason != null){
//             if (url.includes(vfUrl)){
//               if (selectedEpisode > 1) {
//               setSelectedEpisode(selectedEpisode - 1);
//               episode = selectedEpisode - 1;
//               season = selectedSeason;
  
//               } else if (selectedSeason > 1) {
//                   setSelectedSeason(selectedSeason - 1);
//                   setSelectedEpisode(episodes[selectedSeason - 1]);
//                   season = selectedSeason - 1;
//                   episode = episodes[selectedSeason - 1];
//               }
//             }
//             else if (url.includes(voUrl)){
//               if (selectedEpisode > 1) {
//                 setSelectedEpisode(selectedEpisode - 1);
//                 episode = selectedEpisode - 1;
//                 season = selectedSeason;
//               } else if (selectedSeason > 1) {
//                   setSelectedSeason(selectedSeason - 1);
//                   setSelectedEpisode(engEpisodes[selectedSeason - 1]);
//                   season = selectedSeason - 1;
//                   episode = engEpisodes[selectedSeason - 1];
//               }
//             }
//             return {season, episode}

//         }
//       };


//     var vfAvailable: boolean;

//     if (Object.keys(episodes).length > 0)
//         vfAvailable = true;
//     else
//         vfAvailable = false;

//     const handleSelect = (season: number, episode: number) => {
//         setSelectedSeason(season);
//         setSelectedEpisode(episode);
//         if (url.includes(vfUrl)){
//           console.log(url + '&sa=' + season + '&epi=' + episode);
//           setUrl(vfUrl + '&sa=' + season + '&epi=' + episode);
//         }
//         else if (url.includes(voUrl)){
//           setUrl(voUrl + '/' + season + '/' + episode);
//         }
//         setSelectEpi(false);
//         setSeeMovie(true);
//     };

//     const handleSelectLang = (select: boolean) => {
//         setSeeMovie(false); setSelectEpi(false); setSelectLang(true);
//     };

//     const checkDisablePrevandNextButtons = () => {
//       if (url.includes(vfUrl))
//         return selectedSeason === Object.keys(episodes).length && selectedEpisode === episodes[selectedSeason];
//       else if (url.includes(voUrl))
//         return selectedSeason === Object.keys(engEpisodes).length && selectedEpisode === engEpisodes[selectedSeason];
//     }

//     return (
//       <div className="flex flex-col min-h-screen" style={{ 
//         backgroundImage: `url(https://image.tmdb.org/t/p/original${modalStore.show?.backdrop_path})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center"
//       }}>
//         <div className={`flex justify-start items-center h-[10vh] w-full fixed top-0 z-10 ${seeMovie ? 'bg-black' : 'bg-gradient-to-r from-black to-transparent'}`}>
//           <Button
//             aria-label="VF"
//             variant='link'
//             className="rounded-xl h-auto w-auto py-3 my-5 ml-10"
//           >
//             <a href='/' className="flex items-center space-x-2">
//               <Icons.kebab/>
//               <span className="inline-block font-bold">{process.env.NEXT_PUBLIC_SITE_NAME}</span>
//               <span className="sr-only">Home</span>
//             </a>
//           </Button>
//                 <div className='flex justify-evenly w-screen'>
//                     {seeMovie && (
//                         <Button
//                         aria-label="VF"
//                         variant='outline'
//                         className=" rounded-xl h-auto w-auto py-3 my-5 ml-10 gap-3"
//                         disabled={selectedSeason === 1 && selectedEpisode === 1}
//                         onClick={() => {var sel = handlePreviousEpisode(); url.includes(vfUrl) ? setUrl(vfUrl + '&sa=' + sel?.season + '&epi=' + sel?.episode ) : setUrl(voUrl + '/' + sel?.season + '/' + sel?.episode)}}
//                         >
//                             <FaArrowLeft/>
//                             Previous Episode
//                         </Button>
//                     )}
//                     <p className="text-xl font-large leading-9 text-slate-50 sm:text-xl self-center">
//                         {modalStore.show?.title ?? modalStore.show?.name}
                        
                        
//                     </p>
//                     {seeMovie && (
//                             <Button
//                             aria-label="VF"
//                             variant='outline'
//                             className=" rounded-xl h-auto w-auto py-3 my-5 ml-10 gap-3"
//                             disabled={checkDisablePrevandNextButtons()}
//                             onClick={() => {var sel = handleNextEpisode(); url.includes(vfUrl) ? setUrl(vfUrl + '&sa=' + sel?.season + '&epi=' + sel?.episode ) : setUrl(voUrl + '/' + sel?.season + '/' + sel?.episode)}}
//                             >
//                                 Next Episode
//                                 <FaArrowRight/>
//                             </Button>
//                     )}
//                 </div>
//             </div>
//             {selectLang && (
//                 <div style={{ width: '100vw', height: '100vh', maxHeight: "100vh", display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
//                     <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', height: '70%' }} className='gap-6'>
//                         <Button
//                             aria-label="VO"
//                             variant="outline"
//                             className="h-auto flex-shrink-0 gap-2 rounded-xl w-1/4  my-auto py-6"
//                             onClick={() => { setUrl(voUrl); setSelectEpi(true); setSelectLang(false); }}
//                         >
//                             Original Version
//                         </Button>
//                         {vfAvailable && (
//                             <Button
//                                 aria-label="VF"
//                                 variant="outline"
//                                 className="h-auto flex-shrink-0 gap-2 rounded-xl w-1/4 my-auto py-6"
//                                 onClick={() => { setUrl(vfUrl); setSelectEpi(true); setSelectLang(false); }}
//                             >
//                                 French Version
//                             </Button>
//                         )}
//                     </div>
//                     <div className="grid gap-2.5 pt-10 pb-10 pl-40 bg-gradient-to-t from-black to-neutral-900/50" style={{height: '30%', maxHeight: '40%'}}>
//                         <h4 className="text-lg font-medium leading-6 text-slate-50 sm:text-xl">
//                         {modalStore.show?.title ?? modalStore.show?.name}
//                         </h4>
//                         <div className="flex items-center space-x-2 text-sm sm:text-base">
//                         <p className="font-semibold text-green-400">
//                             {Math.round((Number(modalStore.show?.vote_average) / 10) * 100) ??
//                             '-'}
//                             % Match
//                         </p>
//                         {modalStore.show?.release_date ? (
//                             <p>{getYear(modalStore.show?.release_date)}</p>
//                         ) : modalStore.show?.first_air_date ? (
//                             <p>{getYear(modalStore.show?.first_air_date)}</p>
//                         ) : null}
//                         {modalStore.show?.original_language && (
//                             <span className="grid h-4 w-7 place-items-center text-xs font-bold text-neutral-400 ring-1 ring-neutral-400">
//                             {modalStore.show.original_language.toUpperCase()}
//                             </span>
//                         )}
//                         </div>
//                         <p className="line-clamp-3 text-xs text-slate-50 dark:text-slate-50 sm:text-sm">
//                         {modalStore.show?.overview ?? '-'}
//                         </p>
//                         <div className="flex items-center gap-2 text-xs sm:text-sm">
//                         <span className="text-slate-400">Genres:</span>
//                         {genres.map((genre) => genre.name).join(', ')}
//                         </div>
//                     </div>
//                   </div>
                    
//             )}
//             {selectEpi && (
//               <div className="flex-grow pt-[10vh]">
//                 <EpisodeSelector
//                     seasons={url === vfUrl ? episodes : engEpisodes}
//                     onSelect={handleSelect}
//                     langSelect={handleSelectLang}
//                     showId={movieId}
//                     vf={url === vfUrl}
//                 />
//               </div>
//             )}
//             {seeMovie && (
//                 <EmbedPlayer url={url} />
//             )}
//         </div>
//     );
// }
