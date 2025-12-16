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

    // OPTIMIZATION: Run both User lookups in parallel using Promise.all
    const [fan, creator] = await Promise.all([
      User.findOne({ email: session.user.email }).select('_id').lean(),
      User.findOne({ username: creatorUsername }).select('_id').lean()
    ]);

    if (!fan) {
      return NextResponse.json({ error: "Fan not found" }, { status: 404 });
    }

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // OPTIMIZATION: Use lean() for faster query, limit fields populated
    const redemptions = await Redemption.find({
      fanId: fan._id,
      creatorId: creator._id
    })
      .populate('vaultItemId', 'title description type instructions perkType fileType pointCost')
      .sort({ createdAt: -1 })
      .lean();

    const response = NextResponse.json({
      success: true,
      redemptions
    });

    // OPTIMIZATION: Add caching headers (30 sec cache, 60 sec stale-while-revalidate)
    response.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=60');

    return response;

  } catch (error) {
    console.error("Error fetching fan redemptions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
