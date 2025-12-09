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

  useEffect(() => {
    if (session?.user && !session.user.setupCompleted) {
      router.push("/setup");
    }
  }, [session, router]);

  // Show loading state while checking session
  if (status === "loading") {
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
