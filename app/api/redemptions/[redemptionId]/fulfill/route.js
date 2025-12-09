import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";
import Redemption from "@/models/Redemption";

import VaultItem from "@/models/VaultItem";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

await connectDb();

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { redemptionId } = params;

    if (!redemptionId) {
      return NextResponse.json({ error: "Redemption ID is required" }, { status: 400 });
    }

    // Find the creator by email (session uses email)
    const creator = await User.findOne({ email: session.user.email });
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Check if creator is verified
    if (!creator.instagram?.isVerified) {
      return NextResponse.json({ error: "Only verified creators can fulfill redemptions" }, { status: 403 });
    }

    // Find and verify ownership of the redemption
    const redemption = await Redemption.findOne({
      _id: redemptionId,
      creatorId: creator._id,
      status: 'Pending'
    }).populate('vaultItemId', 'title').populate('fanId', 'username name');

    if (!redemption) {
      return NextResponse.json({ error: "Redemption not found, already fulfilled, or unauthorized" }, { status: 404 });
    }

    const fulfilledAt = new Date();

    // Update redemption status to fulfilled
    await Redemption.findByIdAndUpdate(redemptionId, {
      status: 'Fulfilled',
      fulfilledAt: fulfilledAt
    });

    // Bonus logic removed.

    return NextResponse.json({
      success: true,
      message: "Redemption marked as fulfilled successfully"
    });

  } catch (error) {
    console.error("Error fulfilling redemption:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
