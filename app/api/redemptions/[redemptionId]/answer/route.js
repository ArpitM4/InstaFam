import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";
import Redemption from "@/models/Redemption";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notifyCreatorAnswered } from "@/utils/notificationHelpers";

await connectDb();

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { redemptionId } = params;
    const { creatorResponse } = await request.json();

    if (!redemptionId) {
      return NextResponse.json({ error: "Redemption ID is required" }, { status: 400 });
    }

    if (!creatorResponse || !creatorResponse.trim()) {
      return NextResponse.json({ error: "Creator response is required" }, { status: 400 });
    }

    // Find the creator by email (session uses email)
    const creator = await User.findOne({ email: session.user.email });
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Find the redemption
    const redemption = await Redemption.findById(redemptionId).populate('vaultItemId');
    if (!redemption) {
      return NextResponse.json({ error: "Redemption not found" }, { status: 404 });
    }

    // Security check: Verify that the logged-in user is the creator this redemption belongs to
    if (redemption.creatorId.toString() !== creator._id.toString()) {
      return NextResponse.json({ error: "You can only answer redemptions for your own vault items" }, { status: 403 });
    }

    // Verify this redemption requires fan input (Q&A type)
    if (!redemption.fanInput) {
      return NextResponse.json({ error: "This redemption does not require a response" }, { status: 400 });
    }

    // Update the redemption with creator's response
    const updatedRedemption = await Redemption.findByIdAndUpdate(
      redemptionId,
      {
        creatorResponse: creatorResponse.trim(),
        status: 'Fulfilled',
        fulfilledAt: new Date()
      },
      { new: true }
    ).populate('fanId', 'username name')
     .populate('vaultItemId', 'title');

    // Send notification to the fan
    await notifyCreatorAnswered(
      updatedRedemption.fanId._id,
      creator.name,
      updatedRedemption.vaultItemId.title,
      redemptionId
    );

    return NextResponse.json({ 
      success: true, 
      message: "Answer submitted successfully!",
      redemption: {
        id: updatedRedemption._id,
        fanUsername: updatedRedemption.fanId.username,
        vaultItemTitle: updatedRedemption.vaultItemId.title,
        creatorResponse: updatedRedemption.creatorResponse,
        fulfilledAt: updatedRedemption.fulfilledAt
      }
    });

  } catch (error) {
    console.error("Error submitting creator answer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
