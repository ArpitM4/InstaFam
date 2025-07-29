import { NextResponse } from "next/server";
import connectDb from "@/db/ConnectDb";
import Redemption from "@/models/Redemption";

await connectDb();

export async function POST() {
  try {
    // Find all pending redemptions and populate vault item info
    const pendingRedemptions = await Redemption.find({ status: 'Pending' }).populate('vaultItemId');
    
    let updatedCount = 0;
    
    for (const redemption of pendingRedemptions) {
      if (redemption.vaultItemId && redemption.vaultItemId.fileType !== 'text-reward') {
        // This is a Digital File that should be automatically fulfilled
        await Redemption.findByIdAndUpdate(redemption._id, {
          status: 'Fulfilled',
          fulfilledAt: new Date()
        });
        updatedCount++;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updatedCount} Digital File redemptions to Fulfilled status`,
      updatedCount 
    });

  } catch (error) {
    console.error("Error updating redemptions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
