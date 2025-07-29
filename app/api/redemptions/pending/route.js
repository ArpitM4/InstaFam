import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";
import Redemption from "@/models/Redemption";
import VaultItem from "@/models/VaultItem";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

await connectDb();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the creator by email (session uses email)
    const creator = await User.findOne({ email: session.user.email });
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Check if creator is verified
    if (!creator.instagram?.isVerified) {
      return NextResponse.json({ error: "Only verified creators can access redemption requests" }, { status: 403 });
    }

    // Fetch pending redemptions with populated data
    const pendingRedemptions = await Redemption.find({ 
      creatorId: creator._id,
      status: 'Pending'
    })
    .populate('fanId', 'username name')
    .populate('vaultItemId', 'title description perkType requiresFanInput')
    .sort({ redeemedAt: -1 });

    return NextResponse.json({ 
      success: true, 
      redemptions: pendingRedemptions
    });

  } catch (error) {
    console.error("Error fetching pending redemptions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
