import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";
import Redemption from "@/models/Redemption";
import Bonus from "@/models/Bonus";
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

    // Calculate current month FamPoints
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Fetch all FULFILLED redemptions for this creator with populated data
    const redemptions = await Redemption.find({ 
      creatorId: creator._id,
      status: 'Fulfilled', // Only count fulfilled redemptions
      fulfilledAt: { $exists: true, $ne: null } // Must have fulfilledAt date
    })
      .populate('fanId', 'username name')
      .populate('vaultItemId', 'title pointCost')
      .sort({ fulfilledAt: -1 }) // Sort by fulfilled date, not redeemed date
      .lean();


    // Calculate current month FamPoints from fulfilled redemptions only
    const currentMonthRedemptions = redemptions.filter(redemption => {
      const fulfilledDate = new Date(redemption.fulfilledAt);
      return fulfilledDate >= currentMonthStart;
    });
    
    
    const currentMonthFamPoints = currentMonthRedemptions.reduce((sum, redemption) => {
      const points = parseInt(redemption.pointsSpent) || 0;
      return sum + points;
    }, 0);


    // Calculate total FamPoints redeemed from fulfilled redemptions only
    const totalFamPointsRedeemed = redemptions.reduce((sum, redemption) => {
      const points = parseInt(redemption.pointsSpent) || 0;
      return sum + points;
    }, 0);


    // Create bonus records for all months that have fulfilled redemptions
    const monthlyRedemptionGroups = {};
    
    // Group redemptions by month/year
    redemptions.forEach(redemption => {
      const fulfilledDate = new Date(redemption.fulfilledAt);
      const monthKey = `${fulfilledDate.getFullYear()}-${fulfilledDate.getMonth() + 1}`;
      
      if (!monthlyRedemptionGroups[monthKey]) {
        monthlyRedemptionGroups[monthKey] = {
          year: fulfilledDate.getFullYear(),
          month: fulfilledDate.getMonth() + 1,
          redemptions: []
        };
      }
      
      monthlyRedemptionGroups[monthKey].redemptions.push(redemption);
    });


    // Create/update bonus records for each month
    for (const [monthKey, groupData] of Object.entries(monthlyRedemptionGroups)) {
      const bonus = await Bonus.getOrCreateMonthlyBonus(
        creator._id,
        creator.username,
        groupData.month,
        groupData.year
      );

      // Reset and rebuild the bonus record to ensure accuracy
      await bonus.resetRedemptions();

      for (const redemption of groupData.redemptions) {
        await bonus.addRedemption({
          redemptionId: redemption._id,
          fanUsername: redemption.fanId?.username || redemption.fanId?.name || 'Unknown',
          vaultItemTitle: redemption.vaultItemId?.title || 'Unknown Item',
          famPointsSpent: parseInt(redemption.pointsSpent) || 0,
          redeemedAt: redemption.fulfilledAt
        });
      }

    }

    // Also ensure current month exists even if no redemptions
    if (!monthlyRedemptionGroups[`${now.getFullYear()}-${now.getMonth() + 1}`]) {
      await Bonus.getOrCreateMonthlyBonus(
        creator._id, 
        creator.username, 
        now.getMonth() + 1, 
        now.getFullYear()
      );
    }

    // Get updated monthly bonus records after creation/updates
    const monthlyBonuses = await Bonus.find({ creatorId: creator._id })
      .sort({ year: -1, month: -1 })
      .lean();


    // Calculate next bonus period date (first day of next month)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextPayoutDate = nextMonth.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Transform redemption data for the frontend
    const redemptionHistory = redemptions.map(redemption => ({
      id: redemption._id,
      date: redemption.fulfilledAt, // Use fulfilledAt instead of redeemedAt
      fanUsername: redemption.fanId?.username || redemption.fanId?.name || 'Unknown',
      vaultItemTitle: redemption.vaultItemId?.title || 'Unknown Item',
      famPointsSpent: parseInt(redemption.pointsSpent) || 0, // Ensure it's a number
      status: redemption.status
    }));


    return NextResponse.json({
      success: true,
      data: {
        currentMonthFamPoints: currentMonthFamPoints || 0,
        totalFamPointsRedeemed: totalFamPointsRedeemed || 0,
        nextPayoutDate,
        redemptionHistory,
        totalRedemptions: redemptions.length || 0,
        currentMonthRedemptions: currentMonthRedemptions.length || 0,
        monthlyBonuses: monthlyBonuses || []
      }
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
