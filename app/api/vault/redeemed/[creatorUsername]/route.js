import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import ConnectDb from "@/db/ConnectDb";
import Redemption from "@/models/Redemption";
import User from "@/models/User";

export async function GET(request, { params }) {
  try {
    await ConnectDb();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { creatorUsername } = params;

    // Find the creator
    const creator = await User.findOne({ username: creatorUsername });
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Find the fan by email (session uses email)
    const fan = await User.findOne({ email: session.user.email });
    if (!fan) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all redemptions for this fan from this creator
    const redemptions = await Redemption.find({
      fanId: fan._id,
      creatorId: creator._id
    }).populate('vaultItemId');

    const redeemedItemIds = redemptions.map(r => r.vaultItemId._id.toString());

    return NextResponse.json({
      success: true,
      redeemedItems: redeemedItemIds,
      redemptions: redemptions
    });

  } catch (error) {
    console.error("Error fetching redeemed items:", error);
    return NextResponse.json(
      { error: "Failed to fetch redeemed items" },
      { status: 500 }
    );
  }
}
