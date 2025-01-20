"use client"
import Image from "next/image";
import { useEffect, useState } from 'react';


export default function Home() {
  const headings = [
    "Support Your Favorite Creators",
    "Get Exclusive Perks"
  ];
  const animationDuration =10000; // Match CSS animation duration (4 seconds)
  const [textIndex, setTextIndex] = useState(0);
  const [key, setKey] = useState(0); // Key to restart animation

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % headings.length;
        setKey((prevKey) => prevKey + 1); // Force re-render to restart animation
        return nextIndex;
      });
    }, animationDuration); // Match with the CSS duration

    return () => clearInterval(interval);
  }, [headings.length, animationDuration]);

  return (<>
<video className="absolute top-0 left-0 w-full h-full object-cover"
   src="/vid.mp4"
   autoPlay={true}
   loop={true}
   muted={true}/>
<div className="relative z-0 min-h-screen flex items-center justify-center px-6 py-12">

  <div className="relative text-center z-10 px-4 md:px-16">
  <h1
        key={key} // Unique key for restarting animation
        className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 overflow-hidden whitespace-nowrap border-r-4 border-white animate-typing"
      >
        {headings[textIndex]}
      </h1>

    <p className="text-lg sm:text-xl text-white max-w-3xl mx-auto opacity-80 mt-4 animate-fadeIn delay-200">
      Join a community that empowers Instagram creators. Support them directly, access exclusive content, and help them grow.
    </p>

    <a
      href="/signup"
      className="px-8 py-3 mt-8 text-white bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-md text-xl font-semibold transition duration-300 ease-in-out hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 inline-block animate-fadeIn delay-400"
    >
      Get Started
    </a>
  </div>
</div>
</>
  );
}
