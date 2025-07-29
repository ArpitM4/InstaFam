import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";
import VaultItem from "@/models/VaultItem";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

await connectDb();

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = params;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    // Find the creator by email (session uses email)
    const creator = await User.findOne({ email: session.user.email });
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Find and verify ownership of the vault item
    const vaultItem = await VaultItem.findOne({
      _id: itemId,
      creatorId: creator._id
    });

    if (!vaultItem) {
      return NextResponse.json({ error: "Vault item not found or unauthorized" }, { status: 404 });
    }

    // Expire item by setting isActive to false (soft delete)
    await VaultItem.findByIdAndUpdate(itemId, {
      isActive: false,
      expiredAt: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      message: "Vault item expired successfully"
    });

  } catch (error) {
    console.error("Error deleting vault item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
