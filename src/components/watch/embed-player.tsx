'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Star, X, Home } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface EpisodeInfo {
  name: string;
  overview: string;
  runtime: number;
  still_path: string;
  vote_average: number;
}

interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  vote_average: number;
}

interface EmbedPlayerProps {
  url: string;
  showId: string | number;
  seasonData: Season[] | null | undefined;
}

async function fetchEpisodeDetails(id: string | number, seasonNumber: number, episodeNumber: number): Promise<EpisodeInfo | null> {
  try {
    const response = await fetch(`/api/episode-details?id=${id}&seasonNumber=${seasonNumber}&episodeNumber=${episodeNumber}`);
    
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Error fetching episode details:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching episode details:", error);
    return null;
  }
}

function EmbedPlayer({ url, showId, seasonData }: EmbedPlayerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [episodeDetails, setEpisodeDetails] = useState<{ [key: string]: EpisodeInfo }>({});
  const [loadingSeason, setLoadingSeason] = useState<number | null>(null);
  const [currentUrl, setCurrentUrl] = useState(url);
  const version = searchParams.get('version');
  const isTVShow = pathname.startsWith('/watch/tv/');

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.src = currentUrl;
      iframe.addEventListener('load', handleIframeLoaded);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoaded);
      }
    };
  }, [currentUrl]);

  const handleIframeLoaded = () => {
    if (iframeRef.current) {
      iframeRef.current.style.opacity = '1';
    }
  };

  const handleEpisodeSelect = (season: number, episode: number) => {
    setSelectedSeason(season);
    setSelectedEpisode(episode);
    const newUrl = version === 'french'
      ? `https://play.frembed.lol/api/serie.php?id=${showId}&sa=${season}&epi=${episode}`
      : `https://vidsrc.cc/v2/embed/tv/${showId}/${season}/${episode}`;
    setCurrentUrl(newUrl);
    setShowEpisodeSelector(false);

    // Update the URL
    const newPath = version === 'french'
      ? `/watch/tv/${showId}?version=french`
      : `/watch/tv/${showId}`;
    router.push(newPath);
  };

  const handleSeasonExpand = async (season: number) => {
    if (episodeDetails[`${season}-1`]) return; // Season details already fetched

    setLoadingSeason(season);
    const selectedSeason = seasonData?.find(s => s.season_number === season);
    const episodeCount = selectedSeason?.episode_count || 0;
    const details: { [key: string]: EpisodeInfo } = {};

    for (let episode = 1; episode <= episodeCount; episode++) {
      const info = await fetchEpisodeDetails(showId, season, episode);
      if (info) {
        details[`${season}-${episode}`] = info;
      }
    }

    setEpisodeDetails(prev => ({ ...prev, ...details }));
    setLoadingSeason(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        allowFullScreen
        style={{ opacity: 0 }}
        referrerPolicy="no-referrer-when-downgrade"
        sandbox={
          currentUrl.includes('frembed.lol') || currentUrl.includes('frembed.pro')
            ? undefined
            : 'allow-scripts allow-same-origin allow-top-navigation-by-user-activation allow-presentation'
        }
      />
      {isTVShow && (
        <Button
          variant="secondary"
          className="absolute top-4 left-4 rounded-full bg-gray-500/50 backdrop-blur-md text-white"
          onClick={() => setShowEpisodeSelector(!showEpisodeSelector)}
        >
          Episodes
        </Button>
      )}
      <Button
        variant="secondary"
        className="absolute top-4 right-4 rounded-full bg-gray-500/50 backdrop-blur-md text-white"
        onClick={() => {
          window.location.href = '/';
        }}
      >
        <Home className="w-4 h-4" />
      </Button>
      {showEpisodeSelector && isTVShow && (
        <div 
          className="absolute inset-y-0 left-0 w-1/2 bg-gray-300/20 backdrop-blur-md rounded-r-lg overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            transform: showEpisodeSelector ? 'translateX(0)' : 'translateX(-100%)',
          }}
        >
          <Button
            variant="ghost"
            className="absolute top-3 right-3 text-white hover:bg-gray-700/50 z-50"
            onClick={() => {
              console.log('Close button clicked');
              setShowEpisodeSelector(false);
            }}
          >
            <X className="w-6 h-6" />
          </Button>
          <ScrollArea className="h-full pt-16">
            <div className="p-4">
              {seasonData && seasonData.length > 0 ? (
                <Accordion 
                  type="single" 
                  collapsible 
                  className="w-full space-y-2"
                  onValueChange={(value) => {
                    const season = parseInt(value.split('-')[1]);
                    if (!isNaN(season)) {
                      handleSeasonExpand(season);
                    }
                  }}
                >
                  {seasonData
                    .filter(season => season.season_number !== 0)
                    .map((season) => (
                    <AccordionItem key={season.id} value={`season-${season.season_number}`} className="border-0">
                      <AccordionTrigger className="text-lg font-semibold hover:no-underline rounded-lg bg-gray-700/50 px-4 py-2">
                        <div className="flex items-center justify-between w-full">
                          <span>{version === 'french' ? `Saison ${season.season_number}` : `Season ${season.season_number}`}</span>
                          <span className="text-sm font-normal text-gray-300">
                            {season.episode_count} {version === 'french' ? 'épisodes' : 'episodes'}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {loadingSeason === season.season_number ? (
                          <div className="space-y-2 mt-2">
                            {Array.from({ length: 3 }, (_, i) => (
                              <Skeleton key={i} className="w-full h-24" />
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2 mt-2">
                            {Array.from({ length: season.episode_count }, (_, i) => i + 1).map((episode) => {
                              const episodeInfo = episodeDetails[`${season.season_number}-${episode}`];
                              if (!episodeInfo) return null;
                              return (
                                <Button
                                  key={episode}
                                  variant="ghost"
                                  className={`w-full justify-start text-left h-auto py-4 px-4 rounded-lg ${
                                    selectedSeason === season.season_number && selectedEpisode === episode
                                      ? 'bg-gray-600 text-white'
                                      : 'bg-gray-700/50 hover:bg-gray-600/50'
                                  }`}
                                  onClick={() => handleEpisodeSelect(season.season_number, episode)}
                                >
                                  <div className="flex items-start space-x-4 w-full">
                                    {episodeInfo.still_path && (
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
                                        {version === 'french' ? `Épisode ${episode}` : `Episode ${episode}`}: {episodeInfo.name}
                                      </span>
                                      <span className="text-sm text-gray-300 mt-1 line-clamp-2">
                                        {episodeInfo.overview}
                                      </span>
                                      <div className="flex items-center mt-2 text-sm text-gray-400">
                                        <Star className="w-4 h-4 mr-1" />
                                        <span>{episodeInfo.vote_average.toFixed(1)}</span>
                                        <span className="mx-2">•</span>
                                        <span>{episodeInfo.runtime} min</span>
                                      </div>
                                    </div>
                                  </div>
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No episode information available.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

export default EmbedPlayer;

