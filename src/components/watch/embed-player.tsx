'use client';
import React, { useEffect, useRef } from 'react';

interface EmbedPlayerProps {
  url: string;
}

function EmbedPlayer({ url }: EmbedPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.src = url;
      iframe.addEventListener('load', handleIframeLoaded);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoaded);
      }
    };
  }, [url]);

  const handleIframeLoaded = () => {
    if (iframeRef.current) {
      iframeRef.current.style.opacity = '1';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        allowFullScreen
        style={{ opacity: 0 }}
        referrerPolicy="no-referrer-when-downgrade"
        sandbox={
          !url.includes('frembed.pro')
            ? 'allow-scripts allow-same-origin allow-top-navigation-by-user-activation allow-presentation'
            : undefined
        }
      />
      
    </div>
  );
}

export default EmbedPlayer;