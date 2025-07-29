import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";
import VaultItem from "@/models/VaultItem";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

await connectDb();

export async function GET(request, { params }) {
  try {
    const { creatorUsername } = params;
    
    if (!creatorUsername) {
      return NextResponse.json({ error: "Creator username is required" }, { status: 400 });
    }

    // Find the creator
    const creator = await User.findOne({ username: creatorUsername });
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Fetch creator's public vault items
    const vaultItems = await VaultItem.find({ 
      creatorId: creator._id,
      isActive: true 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      items: vaultItems,
      creator: {
        username: creator.username,
        name: creator.name,
        isVerified: creator.instagram?.isVerified || false
      }
    });

  } catch (error) {
    console.error("Error fetching creator vault items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
