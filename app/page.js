import "./globals.css";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import MarketingSplash from "@/components/MarketingSplash";
import HomeFeed from "@/components/HomeFeed";

export default async function Home() {
  const session = await getServerSession(nextAuthConfig);

  if (session?.user && !session.user.setupCompleted) {
    redirect("/setup");
  }

  return (
    session ? <HomeFeed /> : <MarketingSplash />
  );
}
