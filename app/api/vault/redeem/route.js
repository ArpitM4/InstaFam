import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";
import VaultItem from "@/models/VaultItem";
import Redemption from "@/models/Redemption";
import Bonus from "@/models/Bonus";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notifyVaultRedeemed } from "@/utils/notificationHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

await connectDb();

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, fanInput } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    // Find the fan by email (session uses email)
    const fan = await User.findOne({ email: session.user.email });
    if (!fan) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the vault item
    const vaultItem = await VaultItem.findById(itemId);
    if (!vaultItem || !vaultItem.isActive) {
      return NextResponse.json({ error: "Vault item not found" }, { status: 404 });
    }

    // Check if fan has enough points
    const fanPoints = fan.points || 0;
    if (fanPoints < vaultItem.pointCost) {
      return NextResponse.json({ 
        error: "Insufficient points",
        required: vaultItem.pointCost,
        current: fanPoints
      }, { status: 400 });
    }

    // Check if fan has already redeemed this item
    const existingRedemption = await Redemption.findOne({
      fanId: fan._id,
      vaultItemId: vaultItem._id
    });

    if (existingRedemption) {
      return NextResponse.json({ error: "Item already redeemed" }, { status: 400 });
    }

    // Start transaction-like operations
    // Deduct points from fan
    await User.findByIdAndUpdate(fan._id, {
      $inc: { points: -vaultItem.pointCost }
    });

    // Note: We no longer add earnings directly to creator
    // Instead, we track FamPoints through the bonus system

    // Increment unlock count
    await VaultItem.findByIdAndUpdate(vaultItem._id, {
      $inc: { unlockCount: 1 }
    });

    // Create redemption record
    const isDigitalFile = vaultItem.fileType !== 'text-reward';
    
    const redemption = new Redemption({
      fanId: fan._id,
      creatorId: vaultItem.creatorId,
      vaultItemId: vaultItem._id,
      pointsSpent: vaultItem.pointCost,
      fanInput: fanInput ? fanInput.trim() : null,
      status: isDigitalFile ? 'Fulfilled' : 'Pending', // Auto-fulfill digital files
      fulfilledAt: isDigitalFile ? new Date() : null // Set fulfillment date for digital files
    });

    await redemption.save();

    // Update monthly bonus record for the creator ONLY if it's fulfilled
    if (isDigitalFile) { // Only for auto-fulfilled digital files
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      // Get creator details
      const creator = await User.findById(vaultItem.creatorId);
      
      // Get or create monthly bonus record
      const bonus = await Bonus.getOrCreateMonthlyBonus(
        vaultItem.creatorId,
        creator.username,
        currentMonth,
        currentYear
      );

      // Add this redemption to the bonus record
      await bonus.addRedemption({
        redemptionId: redemption._id,
        fanUsername: fan.username || fan.name,
        vaultItemTitle: vaultItem.title,
        famPointsSpent: vaultItem.pointCost,
        redeemedAt: redemption.fulfilledAt // Use fulfilledAt date
      });
    }

    // Send notification to creator for non-digital items that require action
    if (!isDigitalFile) {
      await notifyVaultRedeemed(
        vaultItem.creatorId,
        fan.name,
        vaultItem.title,
        redemption._id
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Item redeemed successfully",
      fileUrl: vaultItem.fileUrl,
      pointsRemaining: fanPoints - vaultItem.pointCost,
      redemption: {
        id: redemption._id,
        redeemedAt: redemption.redeemedAt
      }
    });

  } catch (error) {
    console.error("Error redeeming vault item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
