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
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-lg font-semibold">Loading InstaFam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-background text-text">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        {/* Sidebar */}
        <aside className="w-64 bg-background/30 backdrop-blur-lg border-r border-text/10 p-6 space-y-4 min-h-screen">
          <h2 className="text-xl font-bold mb-6">Creator Dashboard</h2>
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className={`block w-full text-left p-3 rounded-md transition-colors ${
                isActive('/dashboard')
                  ? 'bg-primary/20 text-primary border-l-4 border-primary'
                  : 'hover:bg-text/10 hover:text-primary'
              }`}
            >
              General
            </Link>
            <Link
              href="/dashboard/payment"
              className={`block w-full text-left p-3 rounded-md transition-colors ${
                isActive('/dashboard/payment')
                  ? 'bg-primary/20 text-primary border-l-4 border-primary'
                  : 'hover:bg-text/10 hover:text-primary'
              }`}
            >
              Payment Info
            </Link>
            {user?.instagram?.isVerified && (
              <>
                <Link
                  href="/dashboard/vault"
                  className={`block w-full text-left p-3 rounded-md transition-colors ${
                    isActive('/dashboard/vault')
                      ? 'bg-primary/20 text-primary border-l-4 border-primary'
                      : 'hover:bg-text/10 hover:text-primary'
                  }`}
                >
                  My Vault
                </Link>
                <Link
                  href="/dashboard/requests"
                  className={`block w-full text-left p-3 rounded-md transition-colors ${
                    isActive('/dashboard/requests')
                      ? 'bg-primary/20 text-primary border-l-4 border-primary'
                      : 'hover:bg-text/10 hover:text-primary'
                  }`}
                >
                  Vault Requests
                </Link>
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pb-20">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-background/30 backdrop-blur-lg border-b border-text/10 px-4 py-3">
        <div className="flex space-x-1">
          <Link
            href="/dashboard"
            className={`flex-1 py-3 px-4 text-center rounded-lg font-medium transition-colors ${
              isActive('/dashboard')
                ? 'bg-primary text-text'
                : 'bg-text/10 text-text/70 hover:bg-text/20'
            }`}
          >
            General
          </Link>
          <Link
            href="/dashboard/payment"
            className={`flex-1 py-3 px-4 text-center rounded-lg font-medium transition-colors ${
              isActive('/dashboard/payment')
                ? 'bg-primary text-text'
                : 'bg-text/10 text-text/70 hover:bg-text/20'
            }`}
          >
            Payment
          </Link>
          {user?.instagram?.isVerified && (
            <>
              <Link
                href="/dashboard/vault"
                className={`flex-1 py-3 px-4 text-center rounded-lg font-medium transition-colors ${
                  isActive('/dashboard/vault')
                    ? 'bg-primary text-text'
                    : 'bg-text/10 text-text/70 hover:bg-text/20'
                }`}
              >
                Vault
              </Link>
              <Link
                href="/dashboard/requests"
                className={`flex-1 py-3 px-4 text-center rounded-lg font-medium transition-colors ${
                  isActive('/dashboard/requests')
                    ? 'bg-primary text-text'
                    : 'bg-text/10 text-text/70 hover:bg-text/20'
                }`}
              >
                Requests
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Main Content */}
      <main className="md:hidden p-4 pb-20">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
