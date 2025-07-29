import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";
import Redemption from "@/models/Redemption";
import VaultItem from "@/models/VaultItem";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

await connectDb();

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { creatorUsername } = params;

    if (!creatorUsername) {
      return NextResponse.json({ error: "Creator username is required" }, { status: 400 });
    }

    // Find the fan by email
    const fan = await User.findOne({ email: session.user.email });
    if (!fan) {
      return NextResponse.json({ error: "Fan not found" }, { status: 404 });
    }

    // Find the creator
    const creator = await User.findOne({ username: creatorUsername });
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Fetch fan's redemptions from this creator
    const redemptions = await Redemption.find({ 
      fanId: fan._id,
      creatorId: creator._id
    })
    .populate('vaultItemId', 'title description perkType fileType')
    .sort({ redeemedAt: -1 });

    return NextResponse.json({ 
      success: true, 
      redemptions
    });

  } catch (error) {
    console.error("Error fetching fan redemptions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
