"use client";
import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaUser } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${searchQuery}`);
    }
  };

  return (
    <nav className="absolute bg-white bg-opacity-30 backdrop-blur-lg shadow-md py-4 z-30 w-full">
      <div className="container mx-auto pl-4 flex items-center justify-between">
        <Link href="/">
          <span
            className="text-3xl rubik-vinyl-regula font-extrabold bg-gradient-to-r from-pink-600 via-purple-700 to-pink-600 bg-clip-text text-transparent"
            style={{ fontFamily: '"Playwrite AU SA", sans-serif' }}
          >
            InstaFam
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators..."
            className="px-3 py-2 rounded-md bg-white bg-opacity-70 backdrop-blur-sm border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring focus:border-blue-400"
          />
          <button
            type="submit"
                className="px-4 py-2 mx-4 text-white hover:text-white border border-gray-300 rounded-md hover:bg-gray-800 transition"
          >
            Search
          </button>
        </form>

        {/* Desktop Call-to-Action Buttons */}
        <div className="hidden md:flex space-x-4">
          {!session ? (
            <div>
              <Link
                href="/login"
                className="px-4 py-2 mx-4 text-white hover:text-white border border-gray-300 rounded-md hover:bg-gray-800 transition"
              >
                <button>Log In</button>
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-white bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-md hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 transition"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="relative inline-block text-left group">
              <button className="px-4 py-2 flex items-center text-white hover:text-white border border-none rounded-md transition">
                <FaUser className="mr-2 text-xl" />
                {session.user.name}
              </button>
              <div className="absolute right-0 w-48 bg-black/20 backdrop-blur-md border border-gray-300 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-10">
                <Link href="/earnings">
                  <button className="block px-6 py-3 text-white w-full text-left hover:bg-gray-800 transition">Earnings</button>
                </Link>
                <Link href="/dashboard">
                  <button className="block px-6 py-3 text-white w-full text-left hover:bg-gray-800 transition">Dashboard</button>
                </Link>
                <Link href={`/${session.user.name}`}>
                  <button className="block px-6 py-3 text-white w-full text-left hover:bg-gray-800 transition">Your Page</button>
                </Link>
                <button
                  onClick={signOut}
                  className="block px-6 py-3 text-white w-full text-left hover:bg-gray-800 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white hover:text-blue-500 focus:outline-none"
          aria-label="Toggle Menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
