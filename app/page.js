"use client";
import "./globals.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MarketingSplash from "@/components/MarketingSplash";
import HomeFeed from "@/components/HomeFeed";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const needsSetup = session?.user && !session.user.setupCompleted && !session.user.hasUsername;

  useEffect(() => {
    // Skip setup if user completed it OR already has a username
    if (needsSetup) {
      router.push("/setup");
    }
  }, [needsSetup, router]);

  // Show loading state while checking session OR redirecting to setup
  if (status === "loading" || needsSetup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    session ? <HomeFeed /> : <MarketingSplash />
  );
}
