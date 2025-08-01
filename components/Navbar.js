"use client";

import React, { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaUser } from "react-icons/fa";
import { FaMoon, FaSun } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchuser } from "@/actions/useractions"; // make sure this is working
import { useTheme } from "@/context/ThemeContext";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountType, setAccountType] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const { theme, toggleTheme, ThemeToggle } = useTheme();

  // Show loading state while session is being fetched, but with a fallback timeout
  const isLoading = status === "loading" && initialLoad;

  // Set a timeout to stop showing loading after 3 seconds max
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 3000);
    
    // Clear loading when status changes to authenticated or unauthenticated
    if (status === "authenticated" || status === "unauthenticated") {
      setInitialLoad(false);
    }
    
    return () => clearTimeout(timer);
  }, [status]);

  // Fetch accountType and points from DB
  useEffect(() => {
    const getUserInfo = async () => {
      if (session?.user?.name) {
        const user = await fetchuser(session.user.name);
        setAccountType(user?.accountType);
        // Fetch user points
        try {
          const pointsRes = await fetch('/api/points');
          if (pointsRes.ok) {
            const pointsData = await pointsRes.json();
            setUserPoints(pointsData.totalPoints || 0);
          }
        } catch (error) {
          console.error('Failed to fetch points:', error);
        }
      }
    };
    getUserInfo();
  }, [session]);

  // Debug logging to see what's happening
  useEffect(() => {
    console.log('Session status:', status, 'Session:', session, 'isLoading:', isLoading);
  }, [status, session, isLoading]);

  return (
    <nav className="absolute bg-black shadow-md py-2 z-30 w-full border-b-2 border-dropdown-border">
  <div className="mx-5 flex items-center justify-between">
    {/* Logo */}
    <Link href="/" className="block w-[110px] md:w-[200px] lg:w-[200px] xl:w-[150px]">
      <img
        src="/Text.png"
        alt="InstaFam Logo"
        className="w-full h-auto"
      />
    </Link>

    {/* Desktop Auth Buttons */}

    {/* Desktop Auth Buttons */}
    <div className="hidden md:flex items-center space-x-1">
      {isLoading ? (
        /* Show loading skeleton instead of buttons */
        <div className="flex items-center space-x-1">
          <div className="px-4 py-2 bg-gray-700 rounded-md animate-pulse w-16 h-10"></div>
          <div className="px-4 py-2 bg-gray-700 rounded-md animate-pulse w-20 h-10"></div>
        </div>
      ) : !session ? (
        <>
          <Link href="/login" className="px-4 py-2 mx-3 text-white border border-secondary rounded-md hover:bg-secondary/20 transition">Log In</Link>
          <Link href="/signup" className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/80 transition">Sign Up</Link>
        </>
      ) : (
        <>

          
          <div className="relative inline-block pb text-left group">
            <button className="px-4 py-2 flex items-center text-white rounded-md transition">
              <FaUser className="mr-2 text-xl" />
              {session.user.name}
              
            </button>
            <div className="absolute pb-1 right-0 w-48 bg-black text-white border border-dropdown-border rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-10">
              <Link href="/account" className="block px-6 py-3 hover:bg-dropdown-hover transition">Profile</Link>
              <Link href="/my-fam-points" className="block px-6 py-3 hover:bg-dropdown-hover transition">My Fam Points</Link>
              {accountType === "Creator" && (
                <Link href="/dashboard" className="block px-6 py-3 hover:bg-dropdown-hover transition">Creator Dashboard</Link>
              )}
              <div className="border-t border-dropdown-border my-1"></div>
              <button onClick={signOut} className="block w-full text-left px-6 py-2 hover:bg-dropdown-hover transition">Logout</button>
            </div>
          </div>
          
          {/* Notification Bell */}
          <NotificationBell />
        </>
      )}
    </div>

    {/* Mobile Menu Toggle - Only show for logged in users */}
    {session && !isLoading && (
      <button
        className="md:hidden text-white focus:outline-none"
        aria-label="Toggle Menu"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
    )}

    {/* Mobile Auth Buttons for non-logged-in users */}
    {isLoading ? (
      /* Show loading skeleton for mobile */
      <div className="md:hidden flex space-x-2">
        <div className="px-3 py-1.5 bg-gray-700 rounded-md animate-pulse w-12 h-8"></div>
        <div className="px-3 py-1.5 bg-gray-700 rounded-md animate-pulse w-16 h-8"></div>
      </div>
    ) : !session && (
      <div className="md:hidden flex space-x-2">
        <Link href="/login" className="px-3 py-1.5 text-sm text-white border border-secondary rounded-md hover:bg-secondary/20 transition">Log In</Link>
        <Link href="/signup" className="px-3 py-1.5 text-sm text-white bg-primary rounded-md hover:bg-primary/80 transition">Sign Up</Link>
      </div>
    )}
  </div>

  {/* Mobile Menu - Only for logged in users */}
  {mobileMenuOpen && session && !isLoading && (
    <div className="md:hidden px-4 pt-4 pb-6 space-y-4 bg-black text-white border-t border-white">
      {/* Fam Points Display Mobile */}

      <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="block hover:text-primary">Profile</Link>
            <Link href="/my-fam-points" onClick={() => setMobileMenuOpen(false)} className=" text-white border-primary rounded-md bg-primary/20 hover:bg-primary/30 transition cursor-pointer mb-2 block">
        My Fam Points
      </Link>
      {accountType === "Creator" && (
        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block hover:text-primary">Creator Dashboard</Link>
      )}
      <div className="border-t border-dropdown-border"></div>
      <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="block hover:text-primary">Logout</button>
    </div>
  )}
</nav>
  );
};

export default Navbar;
