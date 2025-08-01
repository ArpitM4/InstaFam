"use client";
import "./globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SEO from "@/components/SEO";

export default function Home() {
  const headings = ["Support Your Favorite Creators", "Get Exclusive Perks"];
  const animationDuration = 10000; // Match with CSS
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

  const [searchQuery, setSearchQuery] = useState("");
const router = useRouter();

const handleSearch = (e) => {
  e.preventDefault();
  if (searchQuery.trim()) {
    router.push(`/search/${searchQuery}`);
  }
};

  return (
    <>
      <SEO 
        title="InstaFam - Connect with Your Favorite Creators"
        description="Join thousands of fans connecting with their favorite creators. Earn points, unlock exclusive content, support creators through donations, and access premium perks on the ultimate creator-fan platform."
        keywords="creator platform, fan engagement, exclusive content, creator support, social network, influencer platform, creator economy, fan community, content creators, monetization"
        url="https://www.instafam.social"
        image="https://www.instafam.social/og-home.jpg"
        type="website"
      />
      
      <video
        className="fixed top-0 left-0 w-full h-full object-cover -z-10"
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
      Join a community that empowers Instagram creators. Support them directly, access exclusive content, and help them grow.
    </p>

    {/* Search Bar */}
    <form
      onSubmit={handleSearch}
      className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fadeIn delay-300"
    >
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search creators..."
        className="w-full sm:w-96 px-4 py-3 rounded-md bg-secondary/90 text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        className="px-6 py-3 font-semibold text-white bg-primary rounded-md hover:bg-primary/90 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
      >
        Search
      </button>
    </form>

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
