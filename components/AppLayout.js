"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import { FaHome, FaCompass, FaCoins, FaBars } from "react-icons/fa";
import NotificationBell from "./NotificationBell";

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { userData, accountType } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Define main routes where sidebar should stay expanded
  const mainRoutes = ['/', '/explore', '/my-fam-points', '/account', '/search'];
  
  // Auto-collapse sidebar on creator pages (dynamic routes)
  useEffect(() => {
    const isMainRoute = mainRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
    const isCreatorPage = !isMainRoute && pathname !== '/';
    
    if (isCreatorPage) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  // For non-authenticated users, just render children (login/signup pages, etc.)
  if (status === "loading") {
    return <>{children}</>;
  }

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar - Full Width */}
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
              {userData?.profilepic ? (
                <Image
                  src={userData.profilepic}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover border-2 border-white/10"
                />
              ) : (
                <img
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(session?.user?.email || 'user')}`}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-white/10"
                />
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar - Toggleable */}
      <aside 
        className={`hidden md:flex fixed left-0 top-14 h-[calc(100vh-56px)] bg-background flex-col py-4 px-2 z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-56' : 'w-[72px]'
        }`}
      >
        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {/* Home */}
          <Link
            href="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              pathname === "/"
                ? "bg-white/10 text-white"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <FaHome className="text-xl flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Home</span>}
          </Link>

          {/* Explore */}
          <Link
            href="/explore"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              pathname === "/explore"
                ? "bg-white/10 text-white"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <FaCompass className="text-xl flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Explore</span>}
          </Link>

          {/* My FamPoints */}
          <Link
            href="/my-fam-points"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              pathname === "/my-fam-points"
                ? "bg-white/10 text-white"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <FaCoins className="text-xl flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">My FamPoints</span>}
          </Link>

          {/* Creator Dashboard Link - Only for creators, opens in new tab */}
          {accountType === "Creator" && (
            <a
              href="/creator/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-300 hover:bg-white/5 hover:text-white"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              {sidebarOpen && (
                <>
                  <span className="font-medium">Creator Dashboard</span>
                  <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </>
              )}
            </a>
          )}
        </nav>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-white/10 z-50">
        <div className="flex items-center justify-around py-2">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
              pathname === "/" ? "text-white" : "text-gray-400"
            }`}
          >
            <FaHome className="text-xl" />
            <span className="text-xs">Home</span>
          </Link>

          {/* Explore */}
          <Link
            href="/explore"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
              pathname === "/explore" ? "text-white" : "text-gray-400"
            }`}
          >
            <FaCompass className="text-xl" />
            <span className="text-xs">Explore</span>
          </Link>

          {/* My FamPoints */}
          <Link
            href="/my-fam-points"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
              pathname === "/my-fam-points" ? "text-white" : "text-gray-400"
            }`}
          >
            <FaCoins className="text-xl" />
            <span className="text-xs">FamPoints</span>
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main 
        className={`pt-14 min-h-screen pb-20 md:pb-0 transition-all duration-300 ${
          sidebarOpen ? 'md:ml-56' : 'md:ml-[72px]'
        }`}
      >
        {/* Page Content */}
        <div className={mainRoutes.includes(pathname) ? 'p-6' : ''}>
          {children}
        </div>
      </main>
    </div>
  );
}
