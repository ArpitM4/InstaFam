"use client";
import "./globals.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";


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
      <video
        className="fixed top-0 left-0 w-full h-full object-cover -z-10"
        src="/vid.mp4"
        autoPlay
        loop
        muted
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-12 py-12 text-center">
  <div className="max-w-4xl w-full">
    <h1
      key={key}
      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 border-r-4 border-white whitespace-nowrap overflow-hidden animate-typing"
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
        className="w-full sm:w-96 px-4 py-3 rounded-md bg-white/90 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
      />
      <button
        type="submit"
        className="px-6 py-3 text-white bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-md hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 transition"
      >
        Search
      </button>
    </form>
  </div>
</div>

    </>
  );
}
