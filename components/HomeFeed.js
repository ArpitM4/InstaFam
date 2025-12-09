"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { FaCoins, FaStar, FaGift, FaSearch, FaExternalLinkAlt } from "react-icons/fa";

// Creator Card Component - now accepts famPoints as prop
function CreatorCard({ creator, showFollowedBadge = false, famPoints = 0 }) {
  // Check if creator has active event or new perk from actual data
  const hasActiveEvent = creator.hasActiveEvent;
  const hasNewPerk = creator.hasNewPerk;

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
              unoptimized
            />
          ) : (
            <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center border-2 border-white/10">
              <span className="text-2xl font-bold text-white/30">
                {(creator.name || creator.username || 'U')[0].toUpperCase()}
              </span>
            </div>
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

      {/* FamPoints - Only show if user has points with this creator */}
      {famPoints > 0 && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <FaCoins className="text-yellow-500" />
          <span className="text-sm text-gray-300">
            Your FamPoints: <strong className="text-white">{famPoints}</strong>
          </span>
        </div>
      )}

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
  const { userData, accountType } = useUser();
  const [followedCreators, setFollowedCreators] = useState([]);
  const [topCreators, setTopCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topCreatorsLoading, setTopCreatorsLoading] = useState(false);
  const [pointsMap, setPointsMap] = useState({}); // Map of creatorId -> points

  const isCreator = accountType === "Creator";
  const hasFollowing = userData?.following && userData.following.length > 0;

  // Fetch user's FamPoints for all creators they have points with
  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const res = await fetch('/api/points');
        if (res.ok) {
          const data = await res.json();
          // Create a lookup map: creatorId -> points
          const map = {};
          if (data.pointsByCreator) {
            data.pointsByCreator.forEach(creator => {
              if (creator.points > 0) {
                map[creator.creatorId] = creator.points;
              }
            });
          }
          setPointsMap(map);
        }
      } catch (err) {
        console.error('Error fetching user points:', err);
      }
    };

    fetchUserPoints();
  }, []);

  useEffect(() => {
    const fetchFollowedCreators = async () => {
      if (!hasFollowing) {
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
  }, [hasFollowing]);

  // Fetch top creators when user has no following
  useEffect(() => {
    const fetchTopCreators = async () => {
      if (hasFollowing) return; // Don't fetch if user has following

      setTopCreatorsLoading(true);
      try {
        const res = await fetch('/api/creators/random');
        if (res.ok) {
          const data = await res.json();
          setTopCreators(data.creators || []);
        }
      } catch (err) {
        console.error('Error fetching top creators:', err);
      } finally {
        setTopCreatorsLoading(false);
      }
    };

    fetchTopCreators();
  }, [hasFollowing]);

  return (
    <>
      {/* Your Page Section - Only for Creators */}
      {isCreator && userData && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Your Page</h1>
              <div className="w-12 h-1 bg-primary rounded-full"></div>
            </div>
            <Link
              href={`/${userData.username}`}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-all duration-200 text-sm font-medium"
            >
              View Page
              <FaExternalLinkAlt className="text-xs" />
            </Link>
          </div>

          <Link href={`/${userData.username}`} className="block max-w-sm">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-primary/30">
              {/* Profile Picture */}
              <div className="flex justify-center mb-4">
                <div className="relative w-20 h-20">
                  {userData.profilepic ? (
                    <Image
                      src={userData.profilepic}
                      alt={userData.name || userData.username}
                      fill
                      sizes="80px"
                      className="rounded-full object-cover border-2 border-primary/30"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center border-2 border-primary/30">
                      <span className="text-2xl font-bold text-white/30">
                        {(userData.name || userData.username || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Creator Name */}
              <h3 className="font-semibold text-white text-center text-lg mb-1">
                {userData.name || userData.username}
              </h3>

              {/* Creator Username */}
              <p className="text-sm text-gray-400 text-center mb-3">
                @{userData.username}
              </p>

              {/* Followers Count */}
              <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
                <span>
                  <strong className="text-white">{userData.followersArray?.length || userData.followers || 0}</strong> followers
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Conditionally show Following or Top Creators */}
      {hasFollowing ? (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {followedCreators.map((creator) => (
                <Link key={creator._id} href={`/${creator.username}`}>
                  <CreatorCard creator={creator} showFollowedBadge={true} famPoints={pointsMap[creator._id] || 0} />
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Top Creators Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Top Creators</h1>
            <div className="w-12 h-1 bg-primary rounded-full"></div>
            <p className="text-gray-400 text-sm mt-2">Discover amazing creators to follow</p>
          </div>

          {topCreatorsLoading || loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : topCreators.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topCreators.map((creator) => (
                <Link key={creator._id} href={`/${creator.username}`}>
                  <CreatorCard creator={creator} famPoints={pointsMap[creator._id] || 0} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
                  <FaSearch className="text-3xl text-gray-500" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">No creators available</h2>
                <p className="text-gray-400 mb-6">Check back later for new creators to discover.</p>
                <Link
                  href="/explore"
                  className="inline-block px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-medium"
                >
                  Explore Creators
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

