"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { FaCoins, FaStar, FaGift, FaSearch } from "react-icons/fa";

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
function CreatorCard({ creator, showFollowedBadge = false }) {
  // Generate consistent FamPoints based on username hash
  const hash = hashCode(creator.username || creator._id || 'default');
  const dummyFamPoints = (hash % 450) + 50; // Range: 50-500
  
  // Check if creator has active event or new perk (consistent based on hash)
  const hasActiveEvent = creator.hasActiveEvent || (hash % 10 > 6);
  const hasNewPerk = !hasActiveEvent && (creator.hasNewPerk || (hash % 10 > 7));

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
              className="rounded-full object-cover border-2 border-white/10"
            />
          ) : (
            <img
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(creator.username)}`}
              alt={creator.name || creator.username}
              className="w-full h-full rounded-full object-cover border-2 border-white/10"
            />
          )}
          {showFollowedBadge && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <FaStar className="text-white text-xs" />
            </div>
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

export default function HomeFeed() {
  const { userData } = useUser();
  const [followedCreators, setFollowedCreators] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <>
      {/* Following Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Following</h1>
        <div className="w-12 h-1 bg-primary rounded-full"></div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : followedCreators.length === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
              <FaSearch className="text-3xl text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No creators yet</h2>
            <p className="text-gray-400 mb-6">Start following creators to see their content here.</p>
            <Link
              href="/explore"
              className="inline-block px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium"
            >
              Explore Creators
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {followedCreators.map((creator) => (
            <Link key={creator._id} href={`/${creator.username}`}>
              <CreatorCard creator={creator} showFollowedBadge={true} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
