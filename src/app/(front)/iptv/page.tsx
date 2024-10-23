'use client'

import * as cheerio from 'cheerio';
// import React, { useState, useEffect, useRef } from 'react';
// import styles from './Home.module.css';
// import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
// import { Container, Row, Col, setConfiguration } from 'react-grid-system';
// import './tabs.css';


// setConfiguration({ gutterWidth: 100 });


async function EventsFetch() {
  try {
    const response = await fetch('https://sportsleading.online/');
    const html = await response.text();
    const $ = cheerio.load(html);

    const events: { title: string; link: string; type: string }[] = [];

    $('.col-12 .single-timeline-content').each((_, element) => {
      const title = $(element).find('h6').text().trim();
      const link = $(element).parent().attr('href');
      const type = $(element).find('p').text().trim();

      if (title && link && type) {
        events.push({ title, link, type });
      }
    });

    return events;

  } catch (error) {
    console.error('Error scraping events:', error);
    return [];
  }
}




// interface SportsEvent {
//   title: string;
//   link: string;
//   type: string;
// }

// export default function Home() {
//   const [sportsEvents, setSportsEvents] = useState<SportsEvent[]>([]);
//   const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
//   const iframeRef = useRef<HTMLIFrameElement>(null);

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const data = await EventsFetch();
//         setSportsEvents(data);
//       } catch (error) {
//         console.error('Error fetching events:', error);
//       }
//     };

//     fetchEvents();
//   }, []);

//   const handleCardClick = (url: string) => {
//     setSelectedEvent(url);
//     setTimeout(() => {
//       if (iframeRef.current) {
//         // Request fullscreen for the iframe
//         if (iframeRef.current.requestFullscreen) {
//           iframeRef.current.requestFullscreen();
//         } else if (iframeRef.current.mozRequestFullScreen) {
//           iframeRef.current.mozRequestFullScreen();
//         } else if (iframeRef.current.webkitRequestFullscreen) {
//           iframeRef.current.webkitRequestFullscreen();
//         } else if (iframeRef.current.msRequestFullscreen) {
//           iframeRef.current.msRequestFullscreen();
//         }
//       }
//     }, 0);
//   };

//   const getEventImage = (eventType: string): string => {
//     const footballKeywords = ['laliga', 'ligue', 'football', 'serie', 'league', 'soccer'];
//     const americanFootballKeywords = ['nfl', 'superbowl', 'college football'];
//     const formulaOneKeywords = ['formula', 'f1', 'grand prix', 'gp', 'racing'];
//     const boxingKeywords = ['boxing', 'fight', 'match', 'mma', 'wwe'];
//     const basketballKeywords = ['basket', 'basketball', 'nba', 'all-stars'];

//     const normalizedEventType = eventType.toLowerCase();

//     if (footballKeywords.some(keyword => normalizedEventType.includes(keyword))) {
//       return '/football.png';
//     } else if (americanFootballKeywords.some(keyword => normalizedEventType.includes(keyword))) {
//       return '/nfl.png';
//     } else if (formulaOneKeywords.some(keyword => normalizedEventType.includes(keyword))) {
//       return '/f1.png';
//     } else if (basketballKeywords.some(keyword => normalizedEventType.includes(keyword))) {
//       return '/nba.png';
//     } else if (boxingKeywords.some(keyword => normalizedEventType.includes(keyword))) {
//       return '/ufc.png';
//     } else {
//       return '/picture.png';
//     }
//   };

//   console.log(sportsEvents);

//   return (
//     <div >
//       <h1 className={styles.title}>TV & Sport Channels</h1>
//         <Tabs >
//             <TabList>
//                 <Tab >Sports</Tab>
//                 <Tab >News</Tab>
//             </TabList>
//             <TabPanel >
//               <Container>
//                 <Row className={styles.row}>
//                   {sportsEvents.map((event, index) => (
//                     <Col
//                       key={index}
//                       className={styles.channelCard}
//                       onClick={() => handleCardClick(event.link)}
//                       xl={3} md={4} sm={6} xs={12}
//                     >
//                       <div className={styles.channelImage}>
//                         <img src={`https://streamsportal.com/image.php?file=${event.title.split(' vs ')[0]}.png`} alt={event.title.split(' vs ')[0]} style={{width:'50px', height:'50px', maxHeight:'50px', maxWidth:'50px'}}/>
//                         <p>vs</p>
//                         <img src={`https://streamsportal.com/image.php?file=${event.title.split(' vs ')[1]}.png`} alt={event.title.split(' vs ')[1]} style={{width:'50px', height:'50px', maxHeight:'50px', maxWidth:'50px'}}/>
//                       </div>
//                       <h3 className={styles.channelTitle}>{event.title}</h3>
//                       {/* <h4 className={styles.type}>{event.type}</h4> */}
//                     </Col>
//                   ))}
//                 </Row>
//               </Container>

//             </TabPanel>
//             <TabPanel >
//                 News Panel
//             </TabPanel>
//         </Tabs>
        

//       {/* Sample genres with manual data
//       <div className={styles.genre}>
//         <h2 className={styles.genreTitle}>News</h2>
//         <div className={styles.scrollContainer}>
//           <div
//             className={styles.channelCard}
//             onClick={() => handleCardClick('https://www.livehdtv.com/embed/trans7/')}
//           >
//             <img className={styles.channelImage} src="/picture.png" alt="Sample News Channel" />
//             <h3 className={styles.channelTitle}>Sample News Channel</h3>
//           </div>
//         </div>
//       </div>

//       <div className={styles.genre}>
//         <h2 className={styles.genreTitle}>Entertainment</h2>
//         <div className={styles.scrollContainer}>
//           <div
//             className={styles.channelCard}
//             onClick={() => handleCardClick('https://www.livehdtv.com/embed/trans7/')}
//           >
//             <img className={styles.channelImage} src="/picture.png" alt="Sample Entertainment Channel" />
//             <h3 className={styles.channelTitle}>Sample Entertainment Channel</h3>
//           </div>
//         </div>
//       </div>*/}

//       {selectedEvent && (
//         <div className={styles.iframeContainer}>
//           <iframe
//             ref={iframeRef}
//             width="100%"
//             height="100%"
//             src={selectedEvent}
//             allowFullScreen
//             sandbox='allow-scripts allow-same-origin allow-top-navigation-by-user-activation'
//           ></iframe>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"

interface SportsEvent {
  title: string
  link: string
  type: string
}

const getBackgroundImage = (type: string) => {
  const sportImages = {
    "Football": "/placeholder.svg?height=400&width=600&text=Football",
    "Basketball": "/placeholder.svg?height=400&width=600&text=Basketball",
    "Tennis": "/placeholder.svg?height=400&width=600&text=Tennis",
    "Formula 1": "/placeholder.svg?height=400&width=600&text=Formula+1",
    "News": "/placeholder.svg?height=400&width=600&text=News",
  }
  return sportImages[type as keyof typeof sportImages] || "/placeholder.svg?height=400&width=600&text=Sports"
}

export default function Component() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [sportsEvents, setSportsEvents] = useState<SportsEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data : SportsEvent[] = await EventsFetch();
        console.log(data);
        setSportsEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const newsChannels: SportsEvent[] = [
    { title: "CNN", link: "#", type: "News" },
    { title: "BBC News", link: "#", type: "News" },
    { title: "Al Jazeera", link: "#", type: "News" },
    { title: "Euronews", link: "#", type: "News" },
    { title: "Sky News", link: "#", type: "News" },
    { title: "MSNBC", link: "#", type: "News" },
  ]

  const handleCardClick = (url: string) => {
    setSelectedEvent(url)
  }

  const ChannelGrid = ({ events }: { events: SportsEvent[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {events.map((event, index) => (
        <Card 
          key={index} 
          className="cursor-pointer hover:shadow-lg transition-shadow bg-opacity-10 bg-white backdrop-filter backdrop-blur-lg border border-gray-600 relative overflow-hidden group rounded-none"
          onClick={() => handleCardClick(event.link)}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity"
            style={{ backgroundImage: `url(${getBackgroundImage(event.type)})` }}
          />
          <CardHeader className="p-4 relative z-10">
            <CardTitle className="text-sm font-medium line-clamp-2 text-gray-200">{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 relative z-10">
            <div className="flex justify-center items-center space-x-2">
              <Image
                src={`/placeholder.svg?height=50&width=50&text=${encodeURIComponent(event.title.split(' vs ')[0])}`}
                alt={event.title.split(' vs ')[0]}
                width={50}
                height={50}
                className="rounded-full bg-gray-700"
              />
              {event.type !== "News" && (
                <>
                  <span className="text-sm font-bold text-gray-300">vs</span>
                  <Image
                    src={`/placeholder.svg?height=50&width=50&text=${encodeURIComponent(event.title.split(' vs ')[1])}`}
                    alt={event.title.split(' vs ')[1]}
                    width={50}
                    height={50}
                    className="rounded-full bg-gray-700"
                  />
                </>
              )}
            </div>
            <p className="mt-2 text-xs text-center text-gray-400">{event.type}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    // <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
    //   <div className="container mx-auto px-4 py-8">
    //     <h1 className="text-3xl font-bold text-center mb-8 text-gray-100">TV & Sport Channels</h1>
    //     <Tabs defaultValue="sports" className="w-full">
    //       <TabsList className="grid w-full grid-cols-2 bg-gray-800 rounded-none">
    //         <TabsTrigger 
    //           value="sports"
    //           className="data-[state=active]:bg-gray-700 data-[state=active]:text-white rounded-none"
    //         >
    //           Sports
    //         </TabsTrigger>
    //         <TabsTrigger 
    //           value="news"
    //           className="data-[state=active]:bg-gray-700 data-[state=active]:text-white rounded-none"
    //         >
    //           News
    //         </TabsTrigger>
    //       </TabsList>
    //       <TabsContent value="sports">
    //         <ScrollArea className="h-[70vh] pr-4">
    //           <ChannelGrid events={sportsEvents} />
    //         </ScrollArea>
    //       </TabsContent>
    //       <TabsContent value="news">
    //         <ScrollArea className="h-[70vh] pr-4">
    //           <ChannelGrid events={newsChannels} />
    //         </ScrollArea>
    //       </TabsContent>
    //     </Tabs>

    //     {selectedEvent && (
    //       <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-filter backdrop-blur-sm">
    //         <div className="w-full h-full max-w-4xl max-h-[80vh] bg-gray-800 overflow-hidden">
    //           <iframe
    //             src={selectedEvent}
    //             className="w-full h-full"
    //             allowFullScreen
    //             sandbox="allow-scripts allow-same-origin allow-top-navigation-by-user-activation"
    //           ></iframe>
    //         </div>
    //       </div>
    //     )}
    //   </div>
    // </div>
    <div>
      Coming Soon !!
    </div>
  )
}
