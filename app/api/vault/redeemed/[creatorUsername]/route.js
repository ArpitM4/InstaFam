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

    // OPTIMIZATION: Run both User lookups in parallel
    const [creator, fan] = await Promise.all([
      User.findOne({ username: creatorUsername }).select('_id').lean(),
      User.findOne({ email: session.user.email }).select('_id').lean()
    ]);

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    if (!fan) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // OPTIMIZATION: Use lean() and only populate needed fields
    const redemptions = await Redemption.find({
      fanId: fan._id,
      creatorId: creator._id
    })
      .populate('vaultItemId', '_id')
      .lean();

    const redeemedItemIds = redemptions
      .filter(r => r.vaultItemId)
      .map(r => r.vaultItemId._id.toString());

    const response = NextResponse.json({
      success: true,
      redeemedItems: redeemedItemIds,
      redemptions: redemptions
    });

    // OPTIMIZATION: Add caching headers (30 sec cache, 60 sec stale-while-revalidate)
    response.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=60');

    return response;

  } catch (error) {
    console.error("Error fetching redeemed items:", error);
    return NextResponse.json(
      { error: "Failed to fetch redeemed items" },
      { status: 500 }
    );
  }
}
