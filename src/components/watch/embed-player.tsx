'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

interface EmbedPlayerProps {
  url: string;
}

function EmbedPlayer(props: EmbedPlayerProps) {
  const router = useRouter();
  const [showBackIcon, setShowBackIcon] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.src = props.url;
    }

    const iframe: HTMLIFrameElement | null = ref.current;
    iframe?.addEventListener('load', handleIframeLoaded);
    return () => {
      iframe?.removeEventListener('load', handleIframeLoaded);
    };
  }, [props.url]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowBackIcon(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setShowBackIcon(false);
      }, 5000);
    };

    window.addEventListener('pointermove', handleMouseMove);

    return () => {
      window.removeEventListener('pointermove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleIframeLoaded = () => {
    if (!ref.current) {
      return;
    }
    const iframe: HTMLIFrameElement = ref.current;
    if (iframe) iframe.style.opacity = '1';
  };

  const handleBackClick = () => {
    history.back();
  };


  //##############################
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    // Fonction de mise à jour des dimensions de l'écran
    const updateDimensions = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };

    // Ajouter un écouteur d'événement lors du redimensionnement de la fenêtre
    window.addEventListener('resize', updateDimensions);

    // Nettoyage de l'écouteur d'événement lors du démontage du composant
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <div
      className='top-10 z-40'
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        
      }}>
      <iframe
        ref={ref}
        width="100%"
        height="100%"
        allow='autoplay'
        allowFullScreen
        style={{ opacity: 0 }}
        referrerPolicy="origin"
        sandbox={
          !props.url.includes('frembed.pro')
            ? 'allow-scripts allow-same-origin allow-top-navigation-by-user-activation allow-presentation'
            : undefined
        }
      />
      {/* <div className='absolute top-2/4 left-0'>{width}</div> */}
      {/* <div className='bg-black absolute h-10 w-24 flex justify-center items-center' style={{right: width >= 1280 ? '400px' : '300px', bottom: width >= 1280 ? '28px' : '0px'}}>{process.env.NEXT_PUBLIC_APP_URL}</div> */}
    </div>
  );
}

export default EmbedPlayer;
