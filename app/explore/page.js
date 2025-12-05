"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaCoins, FaGift, FaSearch } from "react-icons/fa";

// Simple hash function to generate consistent "random" values per creator
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Creator Card Component
function CreatorCard({ creator }) {
  const hash = hashCode(creator.username || creator._id || 'default');
  const dummyFamPoints = (hash % 450) + 50;
  const hasActiveEvent = (hash % 10 > 6);
  const hasNewPerk = !hasActiveEvent && (hash % 10 > 7);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/10">
      {/* Profile Picture */}
      <div className="flex justify-center mb-4">
        <div className="relative w-20 h-20">
          {creator.profilepic ? (
            <Image
              src={creator.profilepic}
              alt={creator.name || creator.username}
              fill
              sizes="80px"
              className="rounded-full object-cover border-2 border-white/10"
            />
          ) : (
            <img
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(creator.username)}`}
              alt={creator.name || creator.username}
              className="w-full h-full rounded-full object-cover border-2 border-white/10"
            />
          )}
        </div>
      </div>

      {/* Creator Name */}
      <h3 className="font-semibold text-white text-center text-lg mb-1">
        {creator.name || creator.username}
      </h3>

      {/* Creator Description */}
      <p className="text-sm text-gray-400 text-center mb-3 line-clamp-2">
        {creator.bio || creator.tagline || `@${creator.username}`}
      </p>

      {/* FamPoints */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <FaCoins className="text-yellow-500" />
        <span className="text-sm text-gray-300">
          Your FamPoints: <strong className="text-white">{dummyFamPoints}</strong>
        </span>
      </div>

      {/* Active Badge */}
      {(hasActiveEvent || hasNewPerk) && (
        <div className="flex justify-center">
          {hasActiveEvent && (
            <span className="px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full flex items-center gap-1 animate-pulse">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Event Live
            </span>
          )}
          {hasNewPerk && (
            <span className="px-3 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full flex items-center gap-1">
              <FaGift className="text-xs" />
              New Perk
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const ExplorePage = () => {
  const [creators, setCreators] = useState([]);
  const [allCreators, setAllCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/explore");
        const data = await res.json();
        setCreators(data);
        setAllCreators(data);
      } catch (err) {
        setCreators([]);
        setAllCreators([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

  // Filter creators based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setCreators(allCreators);
    } else {
      const filtered = allCreators.filter(creator => 
        creator.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setCreators(filtered);
    }
  }, [searchQuery, allCreators]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the useEffect above
  };

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </form>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Explore Creators</h1>
        <div className="w-12 h-1 bg-primary rounded-full"></div>
        <p className="text-gray-400 text-sm mt-4">Discover and support talented content creators</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">{searchQuery ? 'No creators found matching your search' : 'No creators found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {creators.map((user) => (
            <Link key={user._id} href={`/${user.username}`}>
              <CreatorCard creator={user} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default ExplorePage;
