"use client";
import React, { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaUser } from "react-icons/fa";
import Link from "next/link";

const Navbar = () => {
  let sign = "false";
  const { data: session } = useSession();
  if (session) {
    sign = "true";
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="absolute bg-white bg-opacity-30 backdrop-blur-lg shadow-md py-4 z-30 w-full">
      <div className="container mx-auto pl-4 flex items-center justify-between">
        <Link href={"/"}>
          <span
            className="text-3xl rubik-vinyl-regula font-extrabold bg-gradient-to-r from-pink-600 via-purple-700 to-pink-600 bg-clip-text text-transparent"
            style={{ fontFamily: '"Playwrite AU SA", sans-serif' }}
          >
            InstaFam
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden md:flex space-x-8">
          <li>
            <a href="#features" className="text-white hover:text-blue-500 transition">
              Features
            </a>
          </li>
          <li>
            <a href="#pricing" className="text-white hover:text-blue-500 transition">
              Pricing
            </a>
          </li>
          <li>
            <a href="#community" className="text-white hover:text-blue-500 transition">
              Community
            </a>
          </li>
        </ul>

        {/* Desktop Call-to-Action Buttons */}
        <div className="hidden md:flex space-x-4">
          {sign === "false" ? (
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
            <>
              <div className="relative inline-block text-left group">
                <button className="px-4 py-2 flex items-center text-white hover:text-white border border-none rounded-md transition">
                  <FaUser className="mr-2 text-xl" />
                  {session.user.name}
                </button>
                <div className="absolute right-0 w-48 bg-black/20 backdrop-blur-md border border-gray-300 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-10">
                  <button className="block px-6 py-3 text-white border border-none rounded-md hover:bg-gray-800 transition duration-300 w-full text-left">
                    <Link href={"/earnings"}>Earnings</Link>
                  </button>
                  <Link href={"/dashboard"}>
                    <button className="block px-6 py-3 text-white border border-none rounded-md hover:bg-gray-800 transition duration-300 w-full text-left">
                      Dashboard
                    </button>
                  </Link>
                  <Link href={`/${session.user.name}`}>
                    <button className="block px-6 py-3 text-white border border-none rounded-md hover:bg-gray-800 transition duration-300 w-full text-left">
                      Your Page
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                    }}
                    className="block px-6 py-3 text-white border border-none rounded-md hover:bg-gray-800 transition duration-300 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
  <div className="md:hidden bg-white bg-opacity-90 backdrop-blur-lg shadow-md px-4 pt-4 pb-6">
    <ul className="space-y-4">
      <li>
        <a
          href="#features"
          className="block text-gray-800 hover:text-blue-500 transition"
          onClick={() => setMobileMenuOpen(false)}
        >
          Features
        </a>
      </li>
      <li>
        <a
          href="#pricing"
          className="block text-gray-800 hover:text-blue-500 transition"
          onClick={() => setMobileMenuOpen(false)}
        >
          Pricing
        </a>
      </li>
      <li>
        <a
          href="#community"
          className="block text-gray-800 hover:text-blue-500 transition"
          onClick={() => setMobileMenuOpen(false)}
        >
          Community
        </a>
      </li>
    </ul>
    <div className="mt-6 space-y-2">
      {sign === "false" ? (
        <>
          <Link
            href="/login"
            className="block w-full px-4 py-2 text-center text-white bg-gray-800 rounded-md hover:bg-gray-900 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="block w-full px-4 py-2 text-center text-white bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 rounded-md hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sign Up
          </Link>
        </>
      ) : (
        <>
          <div className="flex items-center mb-2">
            <FaUser className="mr-2 text-xl text-gray-800" />
            <span className="text-gray-800">{session.user.name}</span>
          </div>
          <Link
            href="/earnings"
            className="block w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-200 rounded-md transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Earnings
          </Link>
          <Link
            href="/dashboard"
            className="block w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-200 rounded-md transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href={`/${session.user.name}`}
            className="block w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-200 rounded-md transition"
            onClick={() => setMobileMenuOpen(false)}
          >
            Your Page
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              signOut();
            }}
            className="block w-full px-4 py-2 text-left text-white bg-red-500 rounded-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </>
      )}
    </div>
  </div>
)}
      
    </nav>
  );
};

export default Navbar;
