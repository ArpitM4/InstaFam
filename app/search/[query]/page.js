"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SearchResults = ({ params }) => {
  const query = params.query;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${query}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search/${searchQuery}`);
    }
  };

  return (
    <div className="min-h-screen px-4 py-28 bg-black text-white">
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
            className="w-full sm:w-96 px-4 py-3 rounded-md bg-white/90 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-[#e10475] via-pink-600 to-[#e10475] rounded-md hover:from-pink-600 hover:via-purple-600 hover:to-[#e10475] transition"
          >
            Search
          </button>
        </form>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center">
        Search Results for <span className="text-pink-400">"{query}"</span>
      </h1>

      {loading ? (
        <div className="flex justify-center items-center mt-20">
          <div className="w-12 h-12 border-4 border-pink-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : results.length === 0 ? (
        <p className="text-gray-400 text-center">No users found.</p>
      ) : (
        <div className="flex flex-col items-center space-y-6">
          {results.map((user) => (
            <div
              key={user._id}
              className="w-full max-w-xl p-5 bg-white/10 border border-white/10 backdrop-blur-lg rounded-xl shadow-md flex items-center space-x-4 hover:scale-[1.01] transition"
            >
              <img
                src={user.profilepic || "https://picsum.photos/100"}
                alt="profile"
                className="w-16 h-16 rounded-full object-cover border border-white"
              />
              <div className="flex-1">
                <Link href={`/${user.username}`}>
                  <p className="text-xl font-semibold hover:underline hover:text-pink-400 transition">
                    @{user.username}
                  </p>
                </Link>
                <p className="text-sm text-gray-300">
                  Followers: {user.followers || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
