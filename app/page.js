"use client";
import "./globals.css";
import SEO from "@/components/SEO";
import { useSession } from "next-auth/react";
import MarketingSplash from "@/components/MarketingSplash";
import HomeFeed from "@/components/HomeFeed";

export default function Home() {
  const { data: session, status } = useSession();

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={session ? "Your Feed - Sygil" : "Sygil - Connect with Your Favorite Creators"}
        description="Join Sygil to connect with creators, earn points, unlock exclusive content, and support your favorite influencers."
        url="https://www.sygil.app"
        image="https://www.sygil.app/og-home.jpg"
      />
      
      {session ? <HomeFeed /> : <MarketingSplash />}
    </>
  );
}
