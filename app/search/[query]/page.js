"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

const SearchResults = ({ params }) => {
  const query = params.query;
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/search?q=${query}`);
      const data = await res.json();
      setResults(data);
    };
    fetchData();
  }, [query]);

  return (
    <div className="min-h-screen px-4 py-28 bg-black text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Search Results for <span className="text-pink-400">"{query}"</span>
      </h1>

      {results.length === 0 ? (
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
                  <p className="text-xl font-semibold hover:underline hover:text-pink-400 transition">@{user.username}</p>
                </Link>
                <p className="text-sm text-gray-300">Followers: {user.followers || 0}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
