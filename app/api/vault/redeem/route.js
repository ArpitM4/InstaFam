import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";
import VaultItem from "@/models/VaultItem";
import Redemption from "@/models/Redemption";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notifyVaultRedeemed } from "@/utils/notificationHelpers";
import { spendPoints, getAvailablePoints } from "@/utils/pointsHelpers";

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

    // Check if fan has enough available (unexpired) points FOR THIS CREATOR
    // Ensure IDs are strings for helper functions consistency if needed, but Mongoose usually handles ObjectIds.
    // Logging for debugging the 400 error
    console.log(`[Redeem] Processing for fan: ${fan._id}, creator: ${vaultItem.creatorId}, cost: ${vaultItem.pointCost}`);

    const availablePoints = await getAvailablePoints(fan._id, vaultItem.creatorId);

    if (availablePoints < vaultItem.pointCost) {
      return NextResponse.json({
        error: "Insufficient points for this creator",
        required: vaultItem.pointCost,
        available: availablePoints
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
    try {
      // Ensure pointCost is a valid non-negative number
      const cost = Number(vaultItem.pointCost);
      if (cost < 0 || isNaN(cost)) {
        throw new Error("Invalid point cost");
      }

      if (cost > 0) {
        await spendPoints(fan._id, vaultItem.creatorId, cost, `Vault redemption: ${vaultItem.title}`);
      }
    } catch (pointError) {
      console.error("[Redeem] Point transaction failed:", pointError);
      return NextResponse.json({
        error: pointError.message || "Point transaction failed",
        required: vaultItem.pointCost,
        available: availablePoints
      }, { status: 400 });
    }

    // Note: We no longer add earnings directly to creator
    // Instead, we track FamPoints through the bonus system

    // Increment unlock count
    await VaultItem.findByIdAndUpdate(vaultItem._id, {
      $inc: { unlockCount: 1 }
    });

    // Create redemption record
    const isDigitalFile = vaultItem.fileType !== 'text-reward' && vaultItem.fileType !== 'promise';
    const isPromise = vaultItem.fileType === 'promise';
    const isAutoFulfilled = isDigitalFile || isPromise; // Both digital files and promises are auto-fulfilled

    const redemption = new Redemption({
      fanId: fan._id,
      creatorId: vaultItem.creatorId,
      vaultItemId: vaultItem._id,
      pointsSpent: vaultItem.pointCost,
      fanInput: fanInput ? fanInput.trim() : null,
      status: isAutoFulfilled ? 'Fulfilled' : 'Pending', // Auto-fulfill digital files and promises
      fulfilledAt: isAutoFulfilled ? new Date() : null // Set fulfillment date for auto-fulfilled items
    });

    await redemption.save();

    // Bonus logic removed.

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
      pointsRemaining: Math.max(0, (fan.points || 0) - vaultItem.pointCost),
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
