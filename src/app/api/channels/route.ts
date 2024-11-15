import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET() {
  try {
    // Fetch the main page
    const response = await fetch('https://direct-streamfr.online/')
    const html = await response.text()
    const $ = cheerio.load(html)
    
    const channels = (await Promise.all(
      $('.video-card').map(async (_, element) => {
        const $card = $(element)
        const title = $card.attr('title')
        const imageUrl = 'https://direct-streamfr.online' + $card.find('.video-card-image img').attr('src')
        const channelUrl = $card.find('.video-card-image a').attr('href')
        
        if (channelUrl) {
          // Fetch individual channel page to get player URL
          const channelResponse = await fetch(channelUrl)
          const channelHtml = await channelResponse.text()
          const $channel = cheerio.load(channelHtml)
          const playerUrl = $channel('input[value^="https://direct-streamfr.online/player.php?"]').val()
          
          return {
            title,
            imageUrl,
            playerUrl
          }
        } else {
          console.warn(`No channel URL found for ${title}`)
          return null
        }
      }).get()
    )).filter((channel): channel is { title: string; imageUrl: string; playerUrl: string } => channel !== null)
    
    return NextResponse.json(channels)
  } catch (error) {
    console.error('Error fetching channels:', error)
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })
  }
}