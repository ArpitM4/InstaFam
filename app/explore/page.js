"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const ExplorePage = () => {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/explore");
        const data = await res.json();
        setCreators(data);
      } catch (err) {
        setCreators([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCreators();
  }, []);

  return (
    <div className="min-h-screen px-4 py-28 bg-background text-text">
      <h1 className="text-3xl font-bold mb-8 text-pink-500 text-center">Explore Top Creators</h1>
      {loading ? (
        <div className="flex justify-center items-center mt-20">
          <div className="w-12 h-12 border-4 border-primary border-dashed rounded-full animate-spin"></div>
        </div>
      ) : creators.length === 0 ? (
        <p className="text-text/60 text-center">No creators found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
          {creators.map((user) => (
            <Link
              key={user._id}
              href={`/${user.username}`}
              className="w-full max-w-xs p-5 bg-secondary/10 border border-secondary/20 backdrop-blur-lg rounded-xl shadow-md flex flex-col items-center space-y-3 hover:scale-[1.03] transition cursor-pointer"
            >
              <img
                src={user.profilepic || "https://picsum.photos/100"}
                alt="profile"
                className="w-20 h-20 rounded-full object-cover border border-primary/50 mb-2"
              />
              <p className="text-xl font-semibold hover:underline hover:text-primary transition">
                @{user.username}
              </p>
              <p className="text-sm text-text/70">Followers: {user.followers || 0}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
