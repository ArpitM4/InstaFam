import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";
import Redemption from "@/models/Redemption";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

await connectDb();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the creator by email
    const creator = await User.findOne({ email: session.user.email });
    if (!creator) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is a creator
    if (creator.accountType !== "Creator" && creator.accountType !== "VCreator") {
      return NextResponse.json({ error: "Access denied. Creator account required." }, { status: 403 });
    }

    // Get current vault earnings balance from user model
    let vaultEarningsBalance = creator.vaultEarningsBalance || 0;

    // Calculate current month earnings from redemptions (fallback for existing data)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Fetch all redemptions for this creator with populated data
    const redemptions = await Redemption.find({ creatorId: creator._id })
      .populate('fanId', 'username name')
      .populate('vaultItemId', 'title pointCost')
      .sort({ redeemedAt: -1 })
      .lean();

    // Calculate current month earnings from redemptions
    const currentMonthRedemptions = redemptions.filter(redemption => 
      new Date(redemption.redeemedAt) >= currentMonthStart
    );
    
    const currentMonthEarnings = currentMonthRedemptions.reduce((sum, redemption) => 
      sum + (redemption.pointsSpent || 0), 0
    );

    // If vaultEarningsBalance is 0 but we have current month earnings, use the calculated amount
    if (vaultEarningsBalance === 0 && currentMonthEarnings > 0) {
      vaultEarningsBalance = currentMonthEarnings;
    }

    // Calculate next payout date (first day of next month)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextPayoutDate = nextMonth.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Transform redemption data for the frontend
    const redemptionHistory = redemptions.map(redemption => ({
      id: redemption._id,
      date: redemption.redeemedAt,
      fanUsername: redemption.fanId?.username || redemption.fanId?.name || 'Unknown',
      vaultItemTitle: redemption.vaultItemId?.title || 'Unknown Item',
      earnings: redemption.pointsSpent, // 1 point = ₹1
      status: redemption.status
    }));

    return NextResponse.json({
      success: true,
      data: {
        vaultEarningsBalance,
        currentMonthEarnings,
        nextPayoutDate,
        redemptionHistory,
        totalRedemptions: redemptions.length,
        currentMonthRedemptions: currentMonthRedemptions.length
      }
    });

  } catch (error) {
    console.error("Error fetching vault payouts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
