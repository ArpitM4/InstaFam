"use client";
import "../globals.css";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SEO from "@/components/SEO";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";

export default function CreatorsPage() {
  const headings = ["Creator Business at One Place", "Stop Scattering Your Fans."];
  const animationDuration = 10000; // Match with CSS
  const [textIndex, setTextIndex] = useState(0);
  const [key, setKey] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const router = useRouter();
  const { data: session } = useSession();
  const { userData } = useUser();

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % headings.length;
        setKey((prevKey) => prevKey + 1);
        return nextIndex;
      });
    }, animationDuration);

    return () => clearInterval(interval);
  }, []);

  // Set video playback speed to 1.2x
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const setPlaybackRate = () => {
        video.playbackRate = 1.2;
        setVideoLoaded(true); // Mark video as loaded
      };
      
      // Set playback rate immediately if video is already loaded
      if (video.readyState >= 1) {
        setPlaybackRate();
      }
      
      // Also set it when the video loads
      video.addEventListener('loadeddata', setPlaybackRate);
      video.addEventListener('canplay', setPlaybackRate);
      
      return () => {
        video.removeEventListener('loadeddata', setPlaybackRate);
        video.removeEventListener('canplay', setPlaybackRate);
      };
    }
  }, []);

  const handleCreatePage = () => {
    if (!session) {
      // Not logged in - redirect to login
      router.push('/login');
    } else if (userData?.accountType === 'Creator' || userData?.accountType === 'VCreator') {
      // Creator - go to their profile page
      router.push(`/${session.user.name}`);
    } else {
      // User - go to account page
      router.push('/account');
    }
  };

  const getButtonText = () => {
    if (!session) return "Create your Page →";
    if (userData?.accountType === 'Creator' || userData?.accountType === 'VCreator') {
      return "My Page";
    }
    return "Create your Page →";
  };

  return (
    <>
      <SEO
        title="Build Your Creator Business on One Page"
        description="Join Sygil to connect with creators, earn points, unlock exclusive content, and support your favorite influencers."
        url="https://www.sygil.app/creators"
        image="https://www.sygil.app/og-home.jpg"
      />
      
      {/* Fallback background image while video loads */}
      <div 
        className={`fixed top-0 left-0 w-full h-full object-cover -z-20 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: 'url(/vid.png)' }}
      />
      
      <video
        ref={videoRef}
        className={`fixed top-0 left-0 w-full h-full object-cover -z-10 transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        src="/vid.mp4"
        autoPlay
        loop
        muted
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-3 sm:px-6 md:px-12 py-12 text-center">
        <div className="max-w-4xl w-full">
          <h1
            key={key}
            className="text-2xl sm:text-4xl md:text-6xl lg:text-6xl font-extrabold text-white mb-6 border-r-4 border-white whitespace-nowrap overflow-hidden animate-typing"
          >
            {headings[textIndex]}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white opacity-80 mb-8 animate-fadeIn delay-200">
            Bring all your engagement, contributions, links, and loyalty into a single creator page — simple, powerful, and built to grow your brand.
          </p>

          {/* Create Page Button */}
          <div className="flex items-center justify-center animate-fadeIn delay-300">
            <button
              onClick={handleCreatePage}
              className="px-8 py-4 font-semibold text-white bg-primary rounded-md hover:bg-primary/90 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 text-lg"
            >
              {getButtonText()}
            </button>
          </div>

          {/* Explore Link */}
          <div className="pt-20 animate-fadeIn delay-400">
            <Link 
              href="/explore" 
              className="text-white hover:text-white transition-colors duration-200 text-lg font-light animate-pulse-blink"
            >
              Explore Top Creators →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
