"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SearchClient = ({ initialResults, query }) => {
    const [results, setResults] = useState(initialResults || []);
    const [searchQuery, setSearchQuery] = useState(query || ""); // Pre-fill with existing query
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search/${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className="min-h-screen px-4 py-14 bg-background text-text">
            {/* Search Bar */}
            <div className="mb-10">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fadeIn delay-300"
                >
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search creators..."
                        className="w-full sm:w-96 px-4 py-3 rounded-md bg-background text-text border border-secondary/50 placeholder-text/60 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 font-semibold text-text bg-primary rounded-md hover:bg-primary/80 transition"
                    >
                        Search
                    </button>
                </form>
            </div>

            <h1 className="text-xl font-bold mb-8 text-center">
                Search Results for <span className="text-primary">"{query}"</span>
            </h1>

            {results.length === 0 ? (
                <p className="text-text/60 text-center">No users found.</p>
            ) : (
                <div className="flex flex-col items-center space-y-6">
                    {results.map((user) => (
                        <div
                            key={user._id}
                            className="w-full max-w-xl p-5 bg-secondary/10 border border-secondary/20 backdrop-blur-lg rounded-xl shadow-md flex items-center space-x-4 hover:scale-[1.01] transition"
                        >
                            <div className="relative w-16 h-16 flex-shrink-0">
                                <Image
                                    src={user.profilepic || "https://picsum.photos/100"}
                                    alt="profile"
                                    fill
                                    sizes="64px"
                                    className="rounded-full object-cover border border-primary/50"
                                    unoptimized
                                />
                            </div>
                            <div className="flex-1">
                                <Link href={`/${user.username}`}>
                                    <p className="text-xl font-semibold hover:underline hover:text-primary transition">
                                        @{user.username}
                                    </p>
                                </Link>
                                {/* Follower count hidden for privacy */}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchClient;
