import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const seasonNumber = searchParams.get('seasonNumber')
  const episodeNumber = searchParams.get('episodeNumber')
  const apiKey = process.env.NEXT_PRIVATE_TMDB_API_KEY

  if (!id || !seasonNumber || !episodeNumber) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${apiKey}`
    )
    
    if (response.ok) {
      const data = await response.json()
      
      const episodeInfo = {
        name: data.name,
        overview: data.overview,
        runtime: data.runtime,
        still_path: data.still_path,
        vote_average: data.vote_average
      }

      console.log(episodeInfo)
      
      return NextResponse.json(episodeInfo)
    } else {
      return NextResponse.json({ error: 'Failed to fetch episode details' }, { status: response.status })
    }
  } catch (error) {
    console.error("Error fetching episode details:", error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}