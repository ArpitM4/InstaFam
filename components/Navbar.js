"use client";

import React, { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaUser } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchuser } from "@/actions/useractions"; // make sure this is working

const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountType, setAccountType] = useState(null);

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
    <nav className="absolute bg-black shadow-md py-2 z-30 w-full border-y-2 border-y-[#333333]">
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
    <div className="hidden md:flex space-x-4">
      {!session ? (
        <>
          <Link href="/login" className="px-4 py-2 text-white border border-gray-500 rounded-md hover:bg-[#333333]  transition">Log In</Link>
          <Link href="/signup" className="px-4 py-2 text-white bg-[#fb0480] rounded-md hover:bg-[#fb0582] hover:text-white transition">Sign Up</Link>
        </>
      ) : (
        <div className="relative inline-block text-left group">
          <button className="px-4 py-2 flex items-center text-white rounded-md transition">
            <FaUser className="mr-2 text-xl" />
            {session.user.name}
          </button>
          <div className="absolute right-0 w-48 bg-[#000000] text-white border border-[#fb0480] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-200 z-10">
            {accountType === "Creator" && (
              <Link href="/dashboard" className="block px-6 py-3 hover:bg-[#333333]  hover:text-white  transition">Creator Dashboard</Link>
            )}

            <Link href="/account" className="block px-6 py-3 hover:bg-[#333333]   hover:text-white transition">Account</Link>
              {accountType === "Creator" && (
            <Link href={`/${session.user.name}`} className="block px-6 py-3 hover:bg-[#333333]   hover:text-white transition">Your Page</Link>
            )}
            <button onClick={signOut} className="block w-full text-left px-6 py-3 hover:bg-[#333333]  hover:text-white  transition">Logout</button>
          </div>
        </div>
      )}
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
    <div className="md:hidden px-4 pt-4 pb-6 space-y-4 bg-[#000000] text-white border-t border-[#fb0582]">
      {!session ? (
        <>
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block hover:text-[#fb0582]">Log In</Link>
          <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block hover:text-[#fb0582]">Sign Up</Link>
        </>
      ) : (
        <>
          {accountType === "Creator" && (
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block hover:text-[#fb0582]">Creator Dashboard</Link>
          )}
          <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="block hover:text-[#fb0582]">Account</Link>
                    {accountType === "Creator" && (
          <Link href={`/${session.user.name}`} onClick={() => setMobileMenuOpen(false)} className="block hover:text-[#fb0582]">Your Page</Link>)}
          <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="block hover:text-[#fb0582]">Logout</button>
        </>
      )}
    </div>
  )}
</nav>

  );
};

export default Navbar;
