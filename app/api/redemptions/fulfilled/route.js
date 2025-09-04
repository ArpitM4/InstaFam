import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";
import Redemption from "@/models/Redemption";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

await connectDb();

export async function GET() {
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

    // Find all fulfilled redemptions for this creator
    const fulfilledRedemptions = await Redemption.find({
      creatorId: creator._id,
      status: 'Fulfilled'
    })
    .populate('fanId', 'username name')
    .populate('vaultItemId', 'title description perkType requiresFanInput')
    .sort({ fulfilledAt: -1 }); // Most recently fulfilled first

    return NextResponse.json({ 
      success: true, 
      redemptions: fulfilledRedemptions 
    });

  } catch (error) {
    console.error("Error fetching fulfilled redemptions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
