"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const SearchResults = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) return;
    const fetchData = async () => {
      const res = await fetch(`/api/search?q=${query}`);
      const data = await res.json();
      setResults(data);
    };
    fetchData();
  }, [query]);

  return (
    <div className="min-h-screen px-6 py-28 bg-black text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Search Results for "<span className="text-pink-400">{query}</span>"
      </h1>

      {results.length === 0 ? (
        <p className="text-center text-gray-400">No users found.</p>
      ) : (
        <div className="space-y-6 max-w-2xl mx-auto">
          {results.map((user) => (
            <Link href={`/${user.username}`} key={user._id}>
              <div className="flex items-center gap-4 p-5 rounded-xl shadow-md bg-white/10 backdrop-blur-lg hover:bg-white/20 transition cursor-pointer border border-white/20">
                <img
                  src={user.profilepic || "https://picsum.photos/80"}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                />
                <div>
                  <h2 className="text-xl font-semibold">@{user.username}</h2>
                  <p className="text-sm text-gray-300">{user.followers || 0} Followers</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
