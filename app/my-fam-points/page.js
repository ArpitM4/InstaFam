import React from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchMyFamPoints, fetchMyRedemptions } from "@/actions/pointsActions";
import MyFamPointsClient from "@/components/MyFamPointsClient";

export const metadata = {
  title: 'My FamPoints',
  description: 'View your earned FamPoints and redemption history.',
};

export default async function MyFamPointsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  // Fetch data in parallel
  const [pointsResult, redemptionsResult] = await Promise.all([
    fetchMyFamPoints(),
    fetchMyRedemptions()
  ]);

  const pointsData = pointsResult.success ? pointsResult.data : {
    totalPoints: 0,
    pointsByCreator: [],
    transactions: []
  };

  const redemptions = redemptionsResult.success ? redemptionsResult.redemptions : [];

  return (
    <MyFamPointsClient
      pointsData={pointsData}
      redemptions={redemptions}
    />
  );
}
