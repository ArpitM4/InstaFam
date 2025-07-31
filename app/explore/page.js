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
    <div className="min-h-screen px-6 py-28 bg-background text-text">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-2xl font-semibold text-text mb-4">Explore Creators</h1>
          <p className="text-text/60 text-sm">Discover and support talented content creators</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center mt-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text/60">No creators found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creators.map((user) => (
              <Link
                key={user._id}
                href={`/${user.username}`}
                className="group bg-dropdown-hover rounded-2xl p-6 hover:bg-dropdown-hover/80 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <img
                      src={user.profilepic || "https://picsum.photos/100"}
                      alt="profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-text group-hover:text-primary transition-colors">
                      @{user.username}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
