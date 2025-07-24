"use client";

import React, { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaUser } from "react-icons/fa";
import { FaMoon, FaSun } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchuser } from "@/actions/useractions"; // make sure this is working
import { useTheme } from "@/context/ThemeContext";

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountType, setAccountType] = useState(null);
  const { theme, toggleTheme, ThemeToggle } = useTheme();

  // Fetch accountType from DB
  useEffect(() => {
    const getUserInfo = async () => {
      if (session?.user?.name) {
        const user = await fetchuser(session.user.name);
        setAccountType(user?.accountType);
      }
    };
    getUserInfo();
  }, [session]);

  return (
    <nav className="absolute bg-black shadow-md py-2 z-30 w-full border-b-2  border-white">
  <div className="container mx-auto px-4 flex items-center justify-between">
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
    <div className="hidden md:flex items-center space-x-4">
<Link
  href="/explore"
  className="px-4 py-2 text-white rounded-md hover:text-gray-200 transition"
>
  Explore
</Link>
      {!session ? (
        <>
          <Link href="/login" className="px-4 py-2 text-white border border-secondary rounded-md hover:bg-secondary/20 transition">Log In</Link>
          <Link href="/signup" className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/80 transition">Sign Up</Link>
        </>
      ) : (
        <div className="relative inline-block text-left group">
          <button className="px-4 py-2 flex items-center text-white rounded-md transition">
            <FaUser className="mr-2 text-xl" />
            {session.user.name}
          </button>
          <div className="absolute right-0 w-48 bg-black text-white border border-white rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-10">
            {accountType === "Creator" && (
              <Link href="/dashboard" className="block px-6 py-3 hover:bg-secondary/20 transition">Creator Dashboard</Link>
            )}

            <Link href="/account" className="block px-6 py-3 hover:bg-secondary/20 transition">Account</Link>
              {accountType === "Creator" && (
            <Link href={`/${session.user.name}`} className="block px-6 py-3 hover:bg-secondary/20 transition">Your Page</Link>
            )}
            <button onClick={signOut} className="block w-full text-left px-6 py-3 hover:bg-secondary/20 transition">Logout</button>
          </div>
        </div>
      )}
      
      {/* Theme Toggle Button */}
      <div className="ml-2">
        <ThemeToggle />
      </div>
    </div>

    {/* Mobile Menu Toggle */}
    <button
      className="md:hidden text-white focus:outline-none"
      aria-label="Toggle Menu"
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    </button>
  </div>

  {/* Mobile Menu */}
  {mobileMenuOpen && (
    <div className="md:hidden px-4 pt-4 pb-6 space-y-4 bg-black text-white border-t border-white">
      <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className="block hover:text-primary">Explore</Link>
      {!session ? (
        <>
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block hover:text-primary">Log In</Link>
          <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block hover:text-primary">Sign Up</Link>
        </>
      ) : (
        <>
          {accountType === "Creator" && (
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block hover:text-primary">Creator Dashboard</Link>
          )}
          <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="block hover:text-primary">Account</Link>
                    {accountType === "Creator" && (
          <Link href={`/${session.user.name}`} onClick={() => setMobileMenuOpen(false)} className="block hover:text-primary">Your Page</Link>)}
          <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="block hover:text-primary">Logout</button>
        </>
      )}
      
      {/* Mobile Theme Toggle */}
      <div className="pt-2 flex items-center">
        <span className="mr-2 text-white">Theme:</span>
        <ThemeToggle />
      </div>
    </div>
  )}
</nav>
  );
};

export default Navbar;
