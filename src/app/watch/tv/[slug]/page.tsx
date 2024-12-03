import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';
import { addToRecentlyWatched } from '@/utils/recentlyWatched';
import MovieService from '@/services/MovieService';
import { MediaType } from '@/types';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export default async function TVShowPage({ params, searchParams }: { params: { slug: string }, searchParams: { version?: string } }) {
  const idMatch = params.slug.match(/(\d+)/);
  const id = idMatch ? idMatch[0] : null;
  const version = searchParams.version;

  console.log('TV Show watch page params:', { slug: params.slug, id, version });

  if (!id) {
    console.error('Invalid TV show ID:', id);
    notFound();
  }

  try {
    const tvShow = await MovieService.findMovieByIdAndType(parseInt(id), 'tv');

    if (!tvShow) {
      console.error('TV show not found for ID:', id);
      notFound();
    }

    // Add to recently watched


    // Construct the embed URL based on version
    const embedUrl = version === 'french'
      ? `https://play.frembed.lol/api/serie.php?id=${id}`
      : `https://vidsrc.cc/v2/embed/tv/${id}`;

    console.log('Constructed embed URL:', embedUrl);

    return (
      <div className="fixed inset-0 z-50 bg-black">
        <EmbedPlayer url={embedUrl} />
      </div>
    );
  } catch (error) {
    console.error('Error in TV show watch page:', error);
    notFound();
  }
}