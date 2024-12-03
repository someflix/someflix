'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tv, Download, X } from 'lucide-react';
import Image from 'next/image';

const AppInstallButton = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ios');

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
  }, []);

  if (isStandalone) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'ios':
        return (
          <div className="space-y-4 text-center">
            <p className="font-bold text-red-500">NOTE: This App only works with Safari Browser.</p>
            <ol className="list-decimal list-inside space-y-6">
              <li className="flex flex-col items-center">
                <span>Open https://kebabflix.com on Safari Browser.</span>
                <Image src="/images/ios_screenshots/screen1.jpg" alt="Step 1" width={300} height={200} className="mt-2 rounded-xl shadow-md" />
              </li>
              <li className="flex flex-col items-center">
                <span>Click on Share Icon.</span>
                <Image src="/images/ios_screenshots/screen1-2.jpg" alt="Step 2" width={300} height={200} className="mt-2 rounded-xl shadow-md" />
              </li>
              <li className="flex flex-col items-center">
                <span>Scroll down and Click on Add to Home Screen.</span>
                <Image src="/images/ios_screenshots/screen2.jpg" alt="Step 3" width={300} height={200} className="mt-2 rounded-xl shadow-md" />
              </li>
              <li className="flex flex-col items-center">
                <span>Click on Add.</span>
                <Image src="/images/ios_screenshots/screen3.jpg" alt="Step 4" width={300} height={200} className="mt-2 rounded-xl shadow-md" />
              </li>
              <li className="flex flex-col items-center">
                <span>APP ready to use, Open and Enjoy.</span>
                <Image src="/images/ios_screenshots/screen4.jpg" alt="Step 5" width={300} height={200} className="mt-2 rounded-xl shadow-md" />
              </li>
            </ol>
          </div>
        );
      case 'android':
        return (
          <div className="space-y-4 text-center">
            <ol className="list-decimal list-inside space-y-6">
              <li className="flex flex-col items-center">
                <span>Download Our App here and Install It.</span>
                <Image src="/android_screenshots/screen1.png" alt="Step 1" width={300} height={200} className="mt-2 rounded-xl shadow-md" />
              </li>
              <li className="flex flex-col items-center">
                <span>Enable(ON) install unknown apps on Setting &gt; Security and privacy &gt; install unknown apps &gt; Google Chrome.</span>
                <Image src="/android_screenshots/screen2.png" alt="Step 2" width={300} height={200} className="mt-2 rounded-xl shadow-md" />
              </li>
              <li>Ready to Use, Open it and Enjoy.</li>
            </ol>
          </div>
        );
      case 'tv':
        return <p className="text-center">Instructions for TV app installation coming soon.</p>;
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="bg-white/30 backdrop-blur-sm rounded-full p-2 hover:bg-white/50 transition-colors"
        aria-label="Install App"
        onClick={() => setIsOpen(true)}
      >
        <Download className="w-5 h-5" />
      </Button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-[90vw] md:max-w-[60vw] h-[80vh] bg-white/30 backdrop-blur-md rounded-3xl p-6 shadow-2xl overflow-hidden text-black font-bold">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-semibold">Install App</h2>
              <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-full p-2">
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="flex space-x-4 mb-6">
              <Button
                onClick={() => setActiveTab('ios')}
                className={`rounded-full flex-1 ${activeTab === 'ios' ? 'bg-gray-200' : 'bg-transparent'}`}
              >
                <Image src="/images/ios_logo.png" alt="iOS Logo" width={32} height={32} className="mr-2" />
                iOS
              </Button>
              <Button
                onClick={() => setActiveTab('android')}
                className={`rounded-full flex-1 ${activeTab === 'android' ? 'bg-gray-200' : 'bg-transparent'}`}
              >
                <Image src="/images/android_logo.png" alt="Android Logo" width={32} height={32} className="mr-2" />
                Android
              </Button>
              <Button
                onClick={() => setActiveTab('tv')}
                className={`rounded-full flex-1 ${activeTab === 'tv' ? 'bg-gray-200' : 'bg-transparent'}`}
              >
                <Tv className="w-8 h-8 mr-2" />
                TV
              </Button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-8rem)]">
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppInstallButton;