"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import { FaHome, FaCompass, FaCoins, FaBars } from "react-icons/fa";
import NotificationBell from "./NotificationBell";

import PublicNavbar from "./PublicNavbar";
import AuthModal from "./AuthModal";

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { userData, accountType } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const lastScrollY = useRef(0);

  // Define main routes where sidebar should stay expanded
  const mainRoutes = ['/', '/explore', '/my-fam-points', '/account', '/search'];

  // Check if current page is a creator dashboard route (has its own layout)
  const isCreatorDashboardRoute = pathname.startsWith('/creator');

  // Check if current page is a creator profile page (dynamic routes like /username)
  const isCreatorPage = !mainRoutes.some(route => pathname === route || pathname.startsWith(route + '/')) && pathname !== '/' && !isCreatorDashboardRoute;

  // Enforce onboarding flow for new users
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user && !session.user.setupCompleted) {
      // If on setup page, let them be
      if (pathname === '/setup') return;

      // If on a creator page (and not a dashboard), show modal instead of redirect
      if (isCreatorPage) {
        setShowSetupModal(true);
      } else {
        // Otherwise redirect to setup page
        router.push('/setup');
      }
    } else {
      setShowSetupModal(false);
    }
  }, [session, status, pathname, router, isCreatorPage]);

  // Auto-collapse sidebar on creator pages (dynamic routes)
  useEffect(() => {
    if (isCreatorPage) {
      setSidebarOpen(false);
    }
  }, [pathname, isCreatorPage]);

  // Handle scroll for navbar hide/show on creator pages
  useEffect(() => {
    if (!isCreatorPage) {
      setNavbarVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when scrolling up or at top
      if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
        setNavbarVisible(true);
      }
      // Hide navbar when scrolling down
      else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setNavbarVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCreatorPage]);

  // For /creators landing page, always just render children (it has its own navbar)
  // This check must come BEFORE session checks to avoid hydration mismatches
  if (pathname === '/creators') {
    return <>{children}</>;
  }

  // For non-authenticated users, just render children (login/signup pages, etc.)
  if (status === "loading") {
    return <>{children}</>;
  }

  if (!session) {
    // For creator pages (not root), show PublicNavbar
    if (pathname !== '/') {
      return (
        <div className="min-h-screen bg-background">
          <PublicNavbar />
          <main className="pt-16 md:pt-0">
            {children}
          </main>
        </div>
      );
    }
    return <>{children}</>;
  }

  // For /creator routes, just render children (DashboardLayout handles its own layout)
  if (isCreatorDashboardRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Setup Modal for In-Place Onboarding */}
      <AuthModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        initialView="SETUP"
      />

      {/* Top Navbar - Full Width */}
      <header className={`fixed top-0 left-0 right-0 z-50 bg-background border-b border-white/10 transition-transform duration-300 ${navbarVisible ? 'translate-y-0' : '-translate-y-full'
        }`}>
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
              {(userData?.profilepic || session?.user?.image) ? (
                <Image
                  src={userData?.profilepic || session.user.image}
                  alt="Profile"
                  fill
                  sizes="36px"
                  className="rounded-full object-cover border-2 border-white/10"
                  priority
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center border-2 border-white/10">
                  <span className="text-xs font-bold text-white/50">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar - Toggleable */}
      <aside
        className={`hidden md:flex fixed left-0 top-14 h-[calc(100vh-56px)] bg-background flex-col py-4 px-2 z-40 transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-[72px]'
          }`}
      >
        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {/* Home */}
          <Link
            href="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname === "/"
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
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname === "/explore"
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
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname === "/my-fam-points"
              ? "bg-white/10 text-white"
              : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
          >
            <FaCoins className="text-xl flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">My FamPoints</span>}
          </Link>

        </nav>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-white/10 z-50">
        <div className="flex items-center justify-around py-2">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${pathname === "/" ? "text-white" : "text-gray-400"
              }`}
          >
            <FaHome className="text-xl" />
            <span className="text-xs">Home</span>
          </Link>

          {/* Explore */}
          <Link
            href="/explore"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${pathname === "/explore" ? "text-white" : "text-gray-400"
              }`}
          >
            <FaCompass className="text-xl" />
            <span className="text-xs">Explore</span>
          </Link>

          {/* My FamPoints */}
          <Link
            href="/my-fam-points"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${pathname === "/my-fam-points" ? "text-white" : "text-gray-400"
              }`}
          >
            <FaCoins className="text-xl" />
            <span className="text-xs">FamPoints</span>
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main
        className={`pt-14 min-h-screen pb-20 md:pb-0 transition-all duration-300 ${sidebarOpen ? 'md:ml-56' : 'md:ml-[72px]'
          }`}
      >
        {/* Page Content */}
        <div
          // className={mainRoutes.includes(pathname) ? 'p-6' : ''}
          className={mainRoutes.includes(pathname) ? 'p-6' : 'p-2'}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
