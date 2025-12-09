"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchuser } from "@/actions/useractions";
import Link from "next/link";
import Image from "next/image";
import { FaBars, FaHome, FaMoneyBillWave, FaDonate, FaLock, FaInbox, FaExternalLinkAlt, FaGraduationCap } from "react-icons/fa";
import NotificationBell from "./NotificationBell";

const DashboardLayout = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
    } else {
      loadUser();
    }
  }, [session, status]);

  const loadUser = async () => {
    try {
      const userData = await fetchuser(session.user.name);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path) => pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent mb-4 mx-auto"></div>
          <p className="text-text">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Top Navbar - Full Width (Same as AppLayout) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left Side - Hamburger + Logo */}
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Toggle sidebar"
            >
              <FaBars className="text-xl text-white" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/Text.png"
                alt="Sygil"
                width={100}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Right Side - Notifications & Profile */}
          <div className="flex items-center gap-4">
            <NotificationBell />

            <Link href="/account" className="relative w-9 h-9">
              {user?.profilepic ? (
                <Image
                  src={user.profilepic}
                  alt="Profile"
                  fill
                  sizes="36px"
                  className="rounded-full object-cover border-2 border-white/10"
                />
              ) : (
                <Image
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(session?.user?.email || 'user')}`}
                  alt="Profile"
                  fill
                  sizes="36px"
                  className="rounded-full object-cover border-2 border-white/10"
                />
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar - Toggleable (Same style as AppLayout) */}
      <aside
        className={`hidden md:flex fixed left-0 top-14 h-[calc(100vh-56px)] bg-background flex-col py-4 px-2 z-40 transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-[72px]'
          }`}
      >
        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {/* General */}
          <Link
            href="/creator/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/creator/dashboard')
              ? 'bg-white/10 text-white'
              : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
          >
            <FaHome className="text-xl flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">General</span>}
          </Link>

          {/* Leaderboard Payout */}
          <Link
            href="/creator/payment"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/creator/payment')
              ? 'bg-white/10 text-white'
              : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
          >
            <FaMoneyBillWave className="text-xl flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Leaderboard Payout</span>}
          </Link>

          {/* Unranked Donations */}
          <Link
            href="/creator/unranked-donations"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/creator/unranked-donations')
              ? 'bg-white/10 text-white'
              : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
          >
            <FaDonate className="text-xl flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Unranked Donations</span>}
          </Link>

          {/* Vault-related links (only for verified users) */}

          <>
            {/* My Vault */}
            <Link
              href="/creator/vault"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/creator/vault')
                ? 'bg-white/10 text-white'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
            >
              <FaLock className="text-xl flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">My Vault</span>}
            </Link>

            {/* Vault Requests */}
            <Link
              href="/creator/requests"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/creator/requests')
                ? 'bg-white/10 text-white'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
            >
              <FaInbox className="text-xl flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Vault Requests</span>}
            </Link>
          </>


          {/* Divider */}
          <div className="my-4 border-t border-white/10" />

          {/* Your Page - Opens in new tab */}
          <a
            href={`/${session?.user?.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-300 hover:bg-white/5 hover:text-white"
          >
            <FaExternalLinkAlt className="text-lg flex-shrink-0" />
            {sidebarOpen && (
              <>
                <span className="font-medium">Your Page</span>
                <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </>
            )}
          </a>

          {/* Creator School */}
          <Link
            href="/blogs"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-300 hover:bg-white/5 hover:text-white"
          >
            <FaGraduationCap className="text-xl flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Creator School</span>}
          </Link>
        </nav>
      </aside>

      {/* Mobile Navigation - Horizontal scrollable tabs */}
      <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm px-4 py-3 border-b border-white/10">
        <div className="flex space-x-2 overflow-x-auto custom-scrollbar">
          <Link
            href="/creator/dashboard"
            className={`flex-shrink-0 py-2 px-4 text-center rounded-xl font-medium transition-all duration-200 text-sm ${isActive('/creator/dashboard')
              ? 'bg-white/10 text-white'
              : 'bg-white/5 text-gray-300 hover:text-white'
              }`}
          >
            General
          </Link>
          <Link
            href="/creator/payment"
            className={`flex-shrink-0 py-2 px-4 text-center rounded-xl font-medium transition-all duration-200 text-sm ${isActive('/creator/payment')
              ? 'bg-white/10 text-white'
              : 'bg-white/5 text-gray-300 hover:text-white'
              }`}
          >
            Payout
          </Link>
          <Link
            href="/creator/unranked-donations"
            className={`flex-shrink-0 py-2 px-4 text-center rounded-xl font-medium transition-all duration-200 text-sm ${isActive('/creator/unranked-donations')
              ? 'bg-white/10 text-white'
              : 'bg-white/5 text-gray-300 hover:text-white'
              }`}
          >
            Unranked
          </Link>

          <>
            <Link
              href="/creator/vault"
              className={`flex-shrink-0 py-2 px-4 text-center rounded-xl font-medium transition-all duration-200 text-sm ${isActive('/creator/vault')
                ? 'bg-white/10 text-white'
                : 'bg-white/5 text-gray-300 hover:text-white'
                }`}
            >
              Vault
            </Link>
            <Link
              href="/creator/requests"
              className={`flex-shrink-0 py-2 px-4 text-center rounded-xl font-medium transition-all duration-200 text-sm ${isActive('/creator/requests')
                ? 'bg-white/10 text-white'
                : 'bg-white/5 text-gray-300 hover:text-white'
                }`}
            >
              Requests
            </Link>
          </>

          <a
            href={`/${session?.user?.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 py-2 px-4 text-center rounded-xl font-medium transition-all duration-200 text-sm bg-white/5 text-gray-300 hover:text-white"
          >
            Your Page
          </a>
          <Link
            href="/blogs"
            className="flex-shrink-0 py-2 px-4 text-center rounded-xl font-medium transition-all duration-200 text-sm bg-white/5 text-gray-300 hover:text-white"
          >
            Creator School
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <main
        className={`pt-14 min-h-screen pb-20 md:pb-0 transition-all duration-300 ${sidebarOpen ? 'md:ml-56' : 'md:ml-[72px]'
          }`}
      >
        {/* Desktop Content */}
        <div className="hidden md:block p-8">
          {children}
        </div>

        {/* Mobile Content - Extra padding for fixed tabs */}
        <div className="md:hidden p-4 pt-16">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
