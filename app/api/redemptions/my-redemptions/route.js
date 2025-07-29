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

    // Find the fan by email
    const fan = await User.findOne({ email: session.user.email });
    if (!fan) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all redemptions for this fan across all creators
    const redemptions = await Redemption.find({ 
      fanId: fan._id
    })
    .populate('vaultItemId', 'title description perkType fileType pointCost fileUrl')
    .populate('creatorId', 'username')
    .sort({ redeemedAt: -1 });

    return NextResponse.json({ 
      success: true, 
      redemptions
    });

  } catch (error) {
    console.error("Error fetching user redemptions:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
