import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";
import VaultItem from "@/models/VaultItem";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

await connectDb();

export async function GET(request, { params }) {
  try {
    const { creatorUsername } = params;

    if (!creatorUsername) {
      return NextResponse.json({ error: "Creator username is required" }, { status: 400 });
    }

    // OPTIMIZATION: Use lean() and only select needed fields
    const creator = await User.findOne({ username: creatorUsername })
      .select('_id username name instagram.isVerified')
      .lean();

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // OPTIMIZATION: Use lean() for faster query
    const vaultItems = await VaultItem.find({
      creatorId: creator._id,
      isActive: true
    }).sort({ createdAt: -1 }).lean();

    const response = NextResponse.json({
      success: true,
      items: vaultItems,
      creator: {
        username: creator.username,
        name: creator.name,
        isVerified: creator.instagram?.isVerified || false
      }
    });

    // Disable caching for realtime updates
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;

  } catch (error) {
    console.error("Error fetching creator vault items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
