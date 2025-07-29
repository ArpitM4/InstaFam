import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";
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
      return NextResponse.json({ error: "Only verified creators can access vault history" }, { status: 403 });
    }

    // Fetch creator's expired vault items
    const expiredItems = await VaultItem.find({ 
      creatorId: creator._id,
      isActive: false 
    }).sort({ expiredAt: -1 });

    return NextResponse.json({ 
      success: true, 
      items: expiredItems
    });

  } catch (error) {
    console.error("Error fetching vault history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
