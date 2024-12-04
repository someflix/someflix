import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';
import { addToRecentlyWatched } from '@/utils/recentlyWatched';
import MovieService from '@/services/MovieService';
import { notFound } from 'next/navigation';
import { ShowWithGenreAndVideo } from '@/types'; // Assuming this is where the type is defined

export const revalidate = 3600;

interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    version?: string;
  };
}

export default async function TVShowPage({ params, searchParams }: PageProps) {
  const idMatch = params.slug.match(/(\d+)/);
  const id = idMatch ? idMatch[0] : null;
  const version = searchParams.version;

  console.log('TV Show watch page params:', { slug: params.slug, id, version });

  if (!id) {
    console.error('Invalid TV show ID:', id);
    notFound();
  }

  try {
    const tvShowResult: ShowWithGenreAndVideo | null = await MovieService.findMovieByIdAndType(parseInt(id), 'tv');

    if (!tvShowResult) {
      console.error('TV show not found for ID:', id);
      notFound();
    }

    const tvShow: ShowWithGenreAndVideo = tvShowResult;

    // Add to recently watched
    // Construct the embed URL based on version
    const embedUrl = version === 'french'
      ? `https://play.frembed.lol/api/serie.php?id=${id}&sa=1&epi=1`
      : `https://vidsrc.cc/v2/embed/tv/${id}`;

    console.log('Constructed embed URL:', embedUrl);

    // Create a seasonData object from the tvShow data
    const seasonData = (tvShow as any).seasons || null;

    return (
      <div className="fixed inset-0 z-50 bg-black">
        <EmbedPlayer 
          url={embedUrl} 
          showId={id} 
          seasonData={seasonData}
        />
      </div>
    );
  } catch (error) {
    console.error('Error in TV show watch page:', error);
    notFound();
  }
}

