// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { FaArrowLeft } from 'react-icons/fa';
// import MovieService from '@/services/MovieService';
// import { useModalStore } from '@/stores/modal';
// import { Genre, MediaType, Show, ShowWithGenreAndVideo, VideoResult } from '@/types';
// import React from 'react';
// import { getIdFromSlug, getMobileDetect } from '@/lib/utils';
// import CustomImage from '../custom-image';
// import { usePathname } from 'next/navigation';
// import { AxiosResponse } from 'axios';



// type EpisodeSelectorProps = {
//     seasons: { [key: string]: number };
//     onSelect: (season: number, episode: number) => void;
//     langSelect: (select: boolean) => void;
//     vf: boolean;
// };

// const EpisodeSelector: React.FC<EpisodeSelectorProps> = ({ seasons, onSelect, langSelect, vf }) => {
//     const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
//     const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);

//     //##########################

//     // stores
//     const modalStore = useModalStore();
    
  
//     //##########################
//     const handleSeasonClick = (season: number) => {
//         setSelectedSeason((prev) => (prev === season ? null : season));
//         console.log('selected season = ' + season);
//         setSelectedEpisode(null); // Reset episode selection when season changes
//     };

//     const handleEpisodeClick = (episode: number) => {
//         if (selectedSeason !== null) {
//             setSelectedEpisode((prev) => (prev === episode ? null : episode));
//             console.log('selected season = ' + selectedSeason);
//             console.log('selected episode = ' + episode);

//             onSelect(selectedSeason, episode);
//         }
//     };

//     return (
//         <div className=''  style={{  width:'100vw', height:'80%' }}>
//             <div className="p-4 flex gap-6 justify-evenly items-center self-center bg-neutral-950/10" style={{height : '100%'}}>
//                 <div className="flex flex-col space-y-2 w-1/5 mb-4 ">
//                     {Object.keys(seasons).map((season) => (
//                         <Button
//                             key={season}
//                             variant='outline'
//                             className={`px-4 py-6 rounded-lg ${selectedSeason === Number(season) ? 'bg-slate-900  text-white' : 'bg-none'}`}
//                             onClick={() => handleSeasonClick(Number(season))}
//                             >
//                             {vf ? 'Saison' : 'Season'} {season}
//                         </Button>
//                     ))}
//                 </div>
                
//                 {selectedSeason !== null && (
//                     <div className="grid grid-cols-3 gap-4">
//                         {Array.from({ length: seasons[selectedSeason] }, (_, i) => i + 1).map((episode) => (
//                             <Button
//                                 key={episode}
//                                 variant='secondary'
//                                 className={`p-10 rounded_lg ${selectedEpisode === episode ? 'bg-slate-800  text-white' : 'bg-slate-900'}`}
//                                 onClick={() => handleEpisodeClick(episode)}
//                                 >
//                                 {vf ? 'Épisode' : 'Episode'} {episode}
//                             </Button>
//                         ))}
//                     </div>
//                 )}
//             </div>
//             <div className='flex flex-rox justify-center'>
//                 <Button
//                     aria-label="VO"
//                     variant='destructive'
//                     className="h-auto flex-shrink-0 gap-2 rounded-xl w-auto px-8  my-auto py-3"
//                     onClick={() => langSelect(true)}
//                 >
//                     <FaArrowLeft></FaArrowLeft>
//                     {vf ? 'Changer de Langue' : 'Select Version'}
//                 </Button>
//             </div>
//         </div>
//     );
// };

// export default EpisodeSelector;


'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ChevronLeft, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type EpisodeSelectorProps = {
  seasons: { [key: string]: number }
  onSelect: (season: number, episode: number) => void
  langSelect: (select: boolean) => void
  vf: boolean
  showId: string | number
}

interface EpisodeInfo {
  name: string
  overview: string
  runtime: number
  still_path: string
  vote_average: number
}

async function fetchEpisodeDetails(id: string | number, seasonNumber: number, episodeNumber: number): Promise<EpisodeInfo | null> {
  try {
    const response = await fetch(`/api/episode-details?id=${id}&seasonNumber=${seasonNumber}&episodeNumber=${episodeNumber}`)
    
    if (response.ok) {
      const data = await response.json()
      return data as EpisodeInfo
    } else {
      console.error("Error fetching episode details:", response.status)
      return null
    }
  } catch (error) {
    console.error("Error fetching episode details:", error)
    return null
  }
}

export default function EpisodeSelector({ seasons, onSelect, langSelect, vf, showId }: EpisodeSelectorProps) {
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null)
  const [episodeDetails, setEpisodeDetails] = useState<{ [key: string]: EpisodeInfo }>({})
  const [loadingSeason, setLoadingSeason] = useState<number | null>(null)

  const handleEpisodeClick = (season: number, episode: number) => {
    setSelectedSeason(season)
    setSelectedEpisode(episode)
    onSelect(season, episode)
  }

  const handleSeasonExpand = async (season: number) => {
    if (episodeDetails[`${season}-1`]) return // Season details already fetched

    setLoadingSeason(season)
    const episodeCount = seasons[season]
    const details: { [key: string]: EpisodeInfo } = {}

    for (let episode = 1; episode <= episodeCount; episode++) {
      const info = await fetchEpisodeDetails(showId, season, episode)
      if (info) {
        details[`${season}-${episode}`] = info
      }
    }

    setEpisodeDetails(prev => ({ ...prev, ...details }))
    setLoadingSeason(null)
  }

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-4 space-y-4" style={{  width:'100vw', height:'80vh' }}>
      <ScrollArea className="flex pr-4">
        <Accordion 
          type="single" 
          collapsible 
          className="w-full space-y-2"
          onValueChange={(value) => {
            const season = parseInt(value.split('-')[1])
            if (!isNaN(season)) {
              handleSeasonExpand(season)
            }
          }}
        >
          {Object.entries(seasons).map(([season, episodeCount]) => (
            <AccordionItem key={season} value={`season-${season}`} className="border-0">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline rounded-lg bg-secondary px-4 py-2">
                <div className="flex items-center justify-between w-full">
                  <span>{vf ? `Saison ${season}` : `Season ${season}`}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {episodeCount} {vf ? 'épisodes' : 'episodes'}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {loadingSeason === Number(season) ? (
                  <div className="space-y-2 mt-2">
                    {Array.from({ length: 3 }, (_, i) => (
                      <Skeleton key={i} className="w-full h-24" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 mt-2">
                    {Array.from({ length: episodeCount }, (_, i) => i + 1).map((episode) => {
                      const episodeInfo = episodeDetails[`${season}-${episode}`]
                      return (
                        <Button
                          key={episode}
                          variant="ghost"
                          className={`w-full justify-start text-left h-auto py-4 px-4 rounded-lg ${
                            selectedSeason === Number(season) && selectedEpisode === episode
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                          onClick={() => handleEpisodeClick(Number(season), episode)}
                        >
                          <div className="flex items-start space-x-4 w-full">
                            {episodeInfo && episodeInfo.still_path && (
                              <Image
                                src={`https://image.tmdb.org/t/p/w200/${episodeInfo.still_path}`}
                                alt={episodeInfo.name}
                                width={120}
                                height={68}
                                className="rounded-md object-cover"
                              />
                            )}
                            <div className="flex flex-col flex-grow">
                              <span className="font-medium">
                                {vf ? `Épisode ${episode}` : `Episode ${episode}`}: {episodeInfo?.name}
                              </span>
                              <span className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {episodeInfo?.overview}
                              </span>
                              {episodeInfo && (
                                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                                  <Star className="w-4 h-4 mr-1" />
                                  <span>{episodeInfo.vote_average.toFixed(1)}</span>
                                  <span className="mx-2">•</span>
                                  <span>{episodeInfo.runtime} min</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
      <Button
        variant="outline"
        className="w-full sm:w-auto self-center"
        onClick={() => langSelect(true)}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        {vf ? 'Changer de Langue' : 'Select Version'}
      </Button>
    </div>
  )
}