import React from 'react';
import SeriesVersionSelector from '@/components/watch/SeriesVersionSelector';

export const revalidate = 3600;

interface Season {
  season_number: number;
  episode_count: number;
}

interface Item {
  title: string;
  tmdb: string;
  imdb: string;
  year: number | null;
  sa: string;
  epi: string;
  version: string;
  link: string;
}

interface Data {
  status: number;
  result: {
    totalItems: string;
    items: Item[];
  };
}

export interface EpisodeInfo {
  name: string
  overview: string
  runtime: number
  still_path: string
  vote_average: number
}


function countSeasonsAndEpisodes(data: Data): { [key: string]: number } {
  const seasons: { [key: string]: number } = {};

  data.result.items.forEach(item => {
    const season = item.sa;
    if (!seasons[season]) {
      seasons[season] = 0;
    }
    seasons[season]++;
  });

  return seasons;
}


async function checkFrenchVersionAvailability(id: string | undefined) {
  try {
    const response = await fetch(`https://api.frembed.pro/tv/check?id=${id}`);
    const data = await response.json();

    if (data.status === 200 && data.result.totalItems >= 1) {
      const seasonEpisodeCount = countSeasonsAndEpisodes(data);
      return seasonEpisodeCount;
    } else {
      return {};
    }
  } catch (error) {
    console.error('Error fetching movie data:', error);
    return {};
  }
}

async function fetchEnglishEpisodes(id: string | number | undefined){
  const apiKey = process.env.NEXT_PRIVATE_TMDB_API_KEY;
  try {
    const response = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`);
    
    if (response.ok) {
      const data = await response.json();
      const seasons = data.seasons || [];
      const seasonsEpisodes: { [key: string]: number } = {};

      seasons.forEach((season: any) => {
        if (season.season_number !== 0)
          seasonsEpisodes[season.season_number] = season.episode_count;
      });
      return seasonsEpisodes;
    } else {
      return {};
    }

    
  }
  catch(e){
    console.log('Error by fetching TMDB');
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const id = params.slug.split('-').pop();
  const vfAvailable = await checkFrenchVersionAvailability(id);
  const engEpisodes = await fetchEnglishEpisodes(id) || {};
  const voUrl = `https://vidsrc.dev/embed/tv/${id}`;
  const vfUrl = `https://frembed.pro/api/serie.php?id=${id}`;

  // console.log('English Array : ' + engEpisodes);

  if (typeof vfAvailable !== 'boolean' && Object.keys(vfAvailable).length > 0)
    console.log(vfAvailable);

  return (
    <div>
      <SeriesVersionSelector vfUrl={vfUrl} voUrl={voUrl} episodes={vfAvailable} engEpisodes={engEpisodes} />
    </div>
  );
}
