import React from 'react';
import EmbedPlayer from '@/components/watch/embed-player';
import { addToRecentlyWatched } from '@/utils/recentlyWatched';
import MovieService from '@/services/MovieService';
import { MediaType } from '@/types';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export default async function MoviePage({ params, searchParams }: { params: { slug: string }, searchParams: { version?: string } }) {
  const id = params.slug.split('-').pop();
  const version = searchParams.version;
  console.log('Movie watch page params:', { id, version });

  if (!id || id === 'undefined') {
    console.error('Invalid movie ID:', id);
    notFound();
  }

  try {
    const movie = await MovieService.findMovieByIdAndType(parseInt(id), 'movie');

    if (!movie) {
      console.error('Movie not found for ID:', id);
      notFound();
    }


    // Construct the embed URL based on version
    const embedUrl = version === 'french'
      ? `https://play.frembed.lol/api/film.php?id=${id}`
      : `https://vidsrc.dev/embed/movie/${id}`;

    console.log('Constructed embed URL:', embedUrl);

    return <EmbedPlayer url={embedUrl} />;
  } catch (error) {
    console.error('Error in movie watch page:', error);
    notFound();
  }
}