"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchuser } from "@/actions/useractions";
import Link from "next/link";

const DashboardLayout = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
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
    <div className="min-h-screen pt-20 bg-background text-text">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        {/* Sidebar */}
        <aside className="w-64 bg-background/60 backdrop-blur-sm p-6 space-y-2 min-h-screen">
          <h2 className="text-xl font-bold mb-8 text-text/90">Creator Dashboard</h2>
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive('/dashboard')
                  ? 'bg-primary/10 text-primary font-medium shadow-sm'
                  : 'hover:bg-dropdown-hover text-text/80 hover:text-text'
              }`}
            >
              General
            </Link>
            <Link
              href="/dashboard/payment"
              className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive('/dashboard/payment')
                  ? 'bg-primary/10 text-primary font-medium shadow-sm'
                  : 'hover:bg-dropdown-hover text-text/80 hover:text-text'
              }`}
            >
              Leaderboard Payout
            </Link>
            {user?.instagram?.isVerified && (
              <>
                <Link
                  href="/dashboard/vault"
                  className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive('/dashboard/vault')
                      ? 'bg-primary/10 text-primary font-medium shadow-sm'
                      : 'hover:bg-dropdown-hover text-text/80 hover:text-text'
                  }`}
                >
                  My Vault
                </Link>
                <Link
                  href="/dashboard/requests"
                  className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive('/dashboard/requests')
                      ? 'bg-primary/10 text-primary font-medium shadow-sm'
                      : 'hover:bg-dropdown-hover text-text/80 hover:text-text'
                  }`}
                >
                  Vault Requests
                </Link>
                <Link
                  href="/dashboard/vault-payouts"
                  className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive('/dashboard/vault-payouts')
                      ? 'bg-primary/10 text-primary font-medium shadow-sm'
                      : 'hover:bg-dropdown-hover text-text/80 hover:text-text'
                  }`}
                >
                  Vault Payouts
                </Link>
              </>
            )}
            <div className="pt-4">
              <Link
                href={`/${session?.user?.name}`}
                className="block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 hover:bg-dropdown-hover text-text/60 hover:text-text/80 text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Your Page
              </Link>
              <Link
                href="/blogs"
                className="block w-full text-left px-4 py-3 rounded-lg transition-all duration-200 hover:bg-dropdown-hover text-text/60 hover:text-text/80 text-sm"
              >
                Creator School
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 pb-20 bg-background">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-background/80 backdrop-blur-sm px-4 py-4 shadow-sm">
        <div className="flex space-x-2 overflow-x-auto custom-scrollbar">
          <Link
            href="/dashboard"
            className={`flex-shrink-0 py-2 px-4 text-center rounded-lg font-medium transition-all duration-200 text-sm ${
              isActive('/dashboard')
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'bg-dropdown-hover text-text/70 hover:text-text'
            }`}
          >
            General
          </Link>
          <Link
            href="/dashboard/payment"
            className={`flex-shrink-0 py-2 px-4 text-center rounded-lg font-medium transition-all duration-200 text-sm ${
              isActive('/dashboard/payment')
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'bg-dropdown-hover text-text/70 hover:text-text'
            }`}
          >
            Payout
          </Link>
          {user?.instagram?.isVerified && (
            <>
              <Link
                href="/dashboard/vault"
                className={`flex-shrink-0 py-2 px-4 text-center rounded-lg font-medium transition-all duration-200 text-sm ${
                  isActive('/dashboard/vault')
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'bg-dropdown-hover text-text/70 hover:text-text'
                }`}
              >
                Vault
              </Link>
              <Link
                href="/dashboard/requests"
                className={`flex-shrink-0 py-2 px-4 text-center rounded-lg font-medium transition-all duration-200 text-sm ${
                  isActive('/dashboard/requests')
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'bg-dropdown-hover text-text/70 hover:text-text'
                }`}
              >
                Requests
              </Link>
              <Link
                href="/dashboard/vault-payouts"
                className={`flex-shrink-0 py-2 px-4 text-center rounded-lg font-medium transition-all duration-200 text-sm ${
                  isActive('/dashboard/vault-payouts')
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'bg-dropdown-hover text-text/70 hover:text-text'
                }`}
              >
                Payouts
              </Link>
            </>
          )}
          <Link
            href={`/${session?.user?.name}`}
            className="flex-shrink-0 py-2 px-4 text-center rounded-lg font-medium transition-all duration-200 text-sm bg-dropdown-hover text-text/60 hover:text-text/80"
            target="_blank"
            rel="noopener noreferrer"
          >
            Your Page
          </Link>
          <Link
            href="/blogs"
            className="flex-shrink-0 py-2 px-4 text-center rounded-lg font-medium transition-all duration-200 text-sm bg-dropdown-hover text-text/60 hover:text-text/80"
          >
            Creator School
          </Link>
        </div>
      </div>

      {/* Mobile Main Content */}
      <main className="md:hidden p-4 pb-20 bg-background">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
