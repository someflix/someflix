import React from 'react';
import MovieVersionSelector from '@/components/watch/MovieVersionSelector';

export const revalidate = 3600;

async function checkMovieAvailability(id: string | undefined) {
  try {
    const response = await fetch(`https://api.frembed.pro/movies/check?id=${id}`);
    const data = await response.json();

    if (data.status === 200 && data.result.Total >= 1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error fetching movie data:', error);
    return false;
  }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const id = params.slug.split('-').pop();
  const vfAvailable = await checkMovieAvailability(id);
  const voUrl = `https://vidsrc.dev/embed/movie/${id}`;
  const vfUrl = `https://frembed.pro/api/film.php?id=${id}`;

  return (
    <div>
      <MovieVersionSelector vfUrl={vfUrl} voUrl={voUrl} vfAvailable={vfAvailable} />
    </div>
  );
}






// import React from 'react';
// import EmbedPlayer from '@/components/watch/embed-player';
// import { Button } from '@/components/ui/button';


// export const revalidate = 3600;

// async function checkMovieAvailability(id: string | undefined) {
//   try {
//     const response = await fetch(`https://api.frembed.pro/movies/check?id=${id}`);
//     const data = await response.json();

//     if (data.status === 200 && data.result.Total >= 1) {
//       return true;
//     } else {
//       return false;
//     }
//   } catch (error) {
//     console.error('Error fetching movie data:', error);
//     return false;
//   }
// }

// export default async function Page({ params }: { params: { slug: string } }) {
//   const id = params.slug.split('-').pop();
//   const vfAvailable = await checkMovieAvailability(id);
//   var url = `https://vidsrc.cc/v2/embed/movie/${id}`;
//   const vfUrl = `https://frembed.pro/api/film.php?id=${id}`;
//   var player = 'en';
//   var choice = true;

//   return (
//     <div>
//       {vfAvailable && choice && (
//         <>
//           <Button
//             aria-label="VO"
//             className="h-auto flex-shrink-0 gap-2 rounded-xl"
//             onClick={() => {
//               choice = false;
//             }}
//           >
//             Version Originale
//           </Button>
//           <Button
//             aria-label="VF"
//             className="h-auto flex-shrink-0 gap-2 rounded-xl"
//             onClick={() => {
//               choice = false;
//               url = vfUrl;
//             }}
//           >
//             Version Française
//           </Button>
//         </>
//       )}
//       {!vfAvailable && choice && (
//         <EmbedPlayer url={url} />
//       )}
//     </div>
//   );
// }