"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaDesktop, FaMobile, FaExpand } from "react-icons/fa";

const PdfPage = () => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Detect device type
  useEffect(() => {
    if (!isClient) return;

    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768); // Mobile if screen width is 768px or less
    };

    // Check on initial load
    checkDevice();

    // Add event listener for window resize
    window.addEventListener('resize', checkDevice);

    // Cleanup
    return () => window.removeEventListener('resize', checkDevice);
  }, [isClient]);

  // Auto-fullscreen on page load
  useEffect(() => {
    if (isClient) {
      setIsFullscreen(true);
    }
  }, [isClient]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const goBack = () => {
    router.back();
  };

  // URLs for different presentations
  const pcPresentationUrl = "https://gamma.app/embed/j7184zvbm6mmms7"; // Desktop/PC presentation
  const mobilePresentationUrl = "https://gamma.app/embed/qq24tglz2f4t8jo"; // Mobile presentation - REPLACE WITH MOBILE URL WHEN AVAILABLE

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background text-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-text/70">Loading presentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text py-20">
      {/* Presentation Container */}
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'max-w-7xl mx-auto px-4 py-8'}`}>
        <div className="w-full h-full flex flex-col items-center justify-center">
          {/* Device Type Indicator */}
          {!isFullscreen && (
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center gap-4 mb-2">
                <p className="text-text/70 text-sm">
                  Presentation optimized for {isMobile ? 'mobile' : 'desktop'} viewing
                </p>
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 hover:bg-success/20 text-success transition-colors duration-200"
                >
                  <FaExpand className="text-sm" />
                  <span className="font-medium hidden sm:inline">Fullscreen</span>
                </button>
              </div>
              <div className="w-full max-w-md mx-auto h-1 bg-text/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-primary transition-all duration-500 ${isMobile ? 'w-1/2' : 'w-full'}`}
                />
              </div>
            </div>
          )}

          {/* Exit Fullscreen Button (visible in fullscreen mode) */}
          {isFullscreen && (
            <div className={`absolute top-4 right-4 z-[9999] flex items-center gap-2 ${isMobile ? 'top-2 right-2' : 'top-4 right-4'}`}>
              {/* Device indicator in fullscreen */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-white">
                {isMobile ? (
                  <>
                    <FaMobile className="text-xs" />
                    <span className="text-xs font-medium">Mobile</span>
                  </>
                ) : (
                  <>
                    <FaDesktop className="text-xs" />
                    <span className="text-xs font-medium">Desktop</span>
                  </>
                )}
              </div>
              <button
                onClick={toggleFullscreen}
                className={`rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 ${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'}`}
              >
                Exit Fullscreen
              </button>
            </div>
          )}

          {/* Iframe Container */}
          <div className={`w-full ${isFullscreen ? 'h-full' : 'max-w-5xl'} relative`}>
            <div className={`
              relative w-full 
              ${isFullscreen 
                ? 'h-full' 
                : isMobile 
                  ? 'h-[60vh] min-h-[400px]' 
                  : 'h-[70vh] min-h-[500px]'
              }
              rounded-lg overflow-hidden shadow-2xl border border-text/10
            `}>
              <iframe
                src={isMobile ? mobilePresentationUrl : pcPresentationUrl}
                className="w-full h-full border-0"
                allow="fullscreen"
                title={`InstaFam Presentation - ${isMobile ? 'Mobile' : 'Desktop'} View`}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300" id="loading-overlay">
        <div className="bg-background border border-text/20 rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-text/70">Loading presentation...</p>
        </div>
      </div>
    </div>
  );
};

export default PdfPage;
