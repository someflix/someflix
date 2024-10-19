import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FaArrowLeft } from 'react-icons/fa';
import MovieService from '@/services/MovieService';
import { useModalStore } from '@/stores/modal';
import { Genre, MediaType, Show, ShowWithGenreAndVideo, VideoResult } from '@/types';
import React from 'react';
import { getIdFromSlug, getMobileDetect } from '@/lib/utils';
import CustomImage from '../custom-image';
import { usePathname } from 'next/navigation';
import { AxiosResponse } from 'axios';



type EpisodeSelectorProps = {
    seasons: { [key: string]: number };
    onSelect: (season: number, episode: number) => void;
    langSelect: (select: boolean) => void;
    vf: boolean;
};

const EpisodeSelector: React.FC<EpisodeSelectorProps> = ({ seasons, onSelect, langSelect, vf }) => {
    const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
    const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);

    //##########################

    // stores
    const modalStore = useModalStore();
    
  
    //##########################
    const handleSeasonClick = (season: number) => {
        setSelectedSeason((prev) => (prev === season ? null : season));
        console.log('selected season = ' + season);
        setSelectedEpisode(null); // Reset episode selection when season changes
    };

    const handleEpisodeClick = (episode: number) => {
        if (selectedSeason !== null) {
            setSelectedEpisode((prev) => (prev === episode ? null : episode));
            console.log('selected season = ' + selectedSeason);
            console.log('selected episode = ' + episode);

            onSelect(selectedSeason, episode);
        }
    };

    return (
        <div className=''  style={{  width:'100vw', height:'80%' }}>
            <div className="p-4 flex gap-6 justify-evenly items-center self-center bg-neutral-950/10" style={{height : '100%'}}>
                <div className="flex flex-col space-y-2 w-1/5 mb-4 ">
                    {Object.keys(seasons).map((season) => (
                        <Button
                            key={season}
                            variant='outline'
                            className={`px-4 py-6 rounded-lg ${selectedSeason === Number(season) ? 'bg-slate-900  text-white' : 'bg-none'}`}
                            onClick={() => handleSeasonClick(Number(season))}
                            >
                            {vf ? 'Saison' : 'Season'} {season}
                        </Button>
                    ))}
                </div>
                
                {selectedSeason !== null && (
                    <div className="grid grid-cols-3 gap-4">
                        {Array.from({ length: seasons[selectedSeason] }, (_, i) => i + 1).map((episode) => (
                            <Button
                                key={episode}
                                variant='secondary'
                                className={`p-10 rounded_lg ${selectedEpisode === episode ? 'bg-slate-800  text-white' : 'bg-slate-900'}`}
                                onClick={() => handleEpisodeClick(episode)}
                                >
                                {vf ? 'Épisode' : 'Episode'} {episode}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
            <div className='flex flex-rox justify-center'>
                <Button
                    aria-label="VO"
                    variant='destructive'
                    className="h-auto flex-shrink-0 gap-2 rounded-xl w-auto px-8  my-auto py-3"
                    onClick={() => langSelect(true)}
                >
                    <FaArrowLeft></FaArrowLeft>
                    {vf ? 'Changer de Langue' : 'Select Version'}
                </Button>
            </div>
        </div>
    );
};

export default EpisodeSelector;