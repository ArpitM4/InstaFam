"use client";
import "./globals.css";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SEO from "@/components/SEO";
import { useSession, signIn } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import { FaGoogle, FaGithub } from 'react-icons/fa';

// Marketing/Login splash for non-logged-in users
function MarketingSplash() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const headings = ["Creator Business at One Place", "Stop Scattering Your Fans."];
  const animationDuration = 10000;
  const [textIndex, setTextIndex] = useState(0);
  const [key, setKey] = useState(0);

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

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const setPlaybackRate = () => {
        video.playbackRate = 1.2;
        setVideoLoaded(true);
      };
      if (video.readyState >= 1) {
        setPlaybackRate();
      }
      video.addEventListener('loadeddata', setPlaybackRate);
      video.addEventListener('canplay', setPlaybackRate);
      return () => {
        video.removeEventListener('loadeddata', setPlaybackRate);
        video.removeEventListener('canplay', setPlaybackRate);
      };
    }
  }, []);

  return (
    <>
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-3 sm:px-6 md:px-12 py-12">
        <div className="max-w-4xl w-full text-center">
          <h1
            key={key}
            className="text-2xl sm:text-4xl md:text-6xl lg:text-6xl font-extrabold text-white mb-6 border-r-4 border-white whitespace-nowrap overflow-hidden animate-typing"
          >
            {headings[textIndex]}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white opacity-80 mb-10 animate-fadeIn delay-200">
            Join Sygil to connect with your favorite creators, earn points, and unlock exclusive content.
          </p>

          {/* Login Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn delay-300">
            <button
              onClick={() => signIn("google")}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium text-lg w-full sm:w-auto"
            >
              <FaGoogle className="text-xl" />
              Continue with Google
            </button>
            <Link
              href="/login"
              className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium text-lg w-full sm:w-auto"
            >
              Sign in with Email
            </Link>
          </div>

          {/* Sign up link */}
          <p className="mt-6 text-white/70 animate-fadeIn delay-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:text-primary/80 font-medium">
              Sign up
            </Link>
          </p>

          {/* Explore Link */}
          <div className="pt-16 animate-fadeIn delay-500">
            <Link 
              href="/explore" 
              className="text-white hover:text-white transition-colors duration-200 text-lg font-light animate-pulse-blink"
            >
              Explore Top Creators →
            </Link>
          </div>

          {/* For Creators Link */}
          <div className="pt-4 animate-fadeIn delay-500">
            <Link 
              href="/creators" 
              className="text-white/60 hover:text-white transition-colors duration-200 text-sm"
            >
              Are you a creator? Learn more →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// Followed creators feed for logged-in users
function FollowedCreatorsFeed() {
  const [followedCreators, setFollowedCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useUser();

  useEffect(() => {
    const fetchFollowedCreators = async () => {
      if (!userData?.following || userData.following.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/user/following');
        if (res.ok) {
          const data = await res.json();
          setFollowedCreators(data.creators || []);
        }
      } catch (err) {
        console.error('Error fetching followed creators:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedCreators();
  }, [userData?.following]);

  return (
    <div className="min-h-screen px-6 py-28 bg-background text-text">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-semibold text-text mb-4">Your Feed</h1>
          <p className="text-text/60 text-sm">Creators you follow</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center mt-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : followedCreators.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <p className="text-text/60 mb-6">You're not following any creators yet.</p>
              <Link
                href="/explore"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium"
              >
                Explore Creators
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {followedCreators.map((creator) => (
              <Link
                key={creator._id}
                href={`/${creator.username}`}
                className="group bg-dropdown-hover rounded-2xl p-6 hover:bg-dropdown-hover/80 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-20 h-20">
                    <Image
                      src={
                        creator.profilepic ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(creator.username)}`
                      }
                      alt={creator.name || creator.username}
                      fill
                      sizes="80px"
                      className="rounded-full object-cover bg-white"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-text group-hover:text-primary transition-colors">
                      {creator.name || creator.username}
                    </p>
                    <p className="text-text/50 text-sm">@{creator.username}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Discover more section */}
        <div className="mt-16 text-center">
          <Link
            href="/explore"
            className="text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
          >
            Discover more creators →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={session ? "Your Feed - Sygil" : "Sygil - Connect with Your Favorite Creators"}
        description="Join Sygil to connect with creators, earn points, unlock exclusive content, and support your favorite influencers."
        url="https://www.sygil.app"
        image="https://www.sygil.app/og-home.jpg"
      />
      
      {session ? <FollowedCreatorsFeed /> : <MarketingSplash />}
    </>
  );
}
