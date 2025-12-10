"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaCoins, FaGift, FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";

// Creator Card Component - accepts famPoints as prop
function CreatorCard({ creator, famPoints = 0 }) {
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
                </div>
            </div>

            {/* Creator Name */}
            <h3 className="font-semibold text-white text-center text-lg mb-1 flex items-center justify-center gap-1.5">
                {creator.name || creator.username}
                {creator.isVerified && (
                    <span className="text-blue-400 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    </span>
                )}
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

const ExploreClient = ({ initialCreators }) => {
    const [creators, setCreators] = useState(initialCreators || []);
    const [allCreators, setAllCreators] = useState(initialCreators || []);
    const [searchQuery, setSearchQuery] = useState("");
    const [pointsMap, setPointsMap] = useState({}); // Map of creatorId -> points
    const router = useRouter();

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

    // Filter creators based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setCreators(allCreators);
        } else {
            const filtered = allCreators.filter(creator =>
                (creator.name && creator.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (creator.username && creator.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (creator.bio && creator.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (creator.tagline && creator.tagline.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setCreators(filtered);
        }
    }, [searchQuery, allCreators]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search/${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className="px-6 pb-6 pt-2">
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

            {creators.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-400">{searchQuery ? 'No creators found matching your search' : 'No creators found'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {creators.map((user) => (
                        <Link key={user._id} href={`/${user.username}`}>
                            <CreatorCard creator={user} famPoints={pointsMap[user._id] || 0} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExploreClient;
