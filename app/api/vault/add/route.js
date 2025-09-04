import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";
import VaultItem from "@/models/VaultItem";
import { nextAuthConfig } from "@/app/api/auth/[...nextauth]/route";
import { notifyFollowersNewVaultItem } from "@/utils/notificationHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

await connectDb();

export async function POST(request) {
  try {
    const session = await getServerSession(nextAuthConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, pointCost, fileUrl, fileType, requiresFanInput, perkType } = await request.json();

    // Validate required fields
    if (!title || !description || !pointCost || !fileType) {
      return NextResponse.json({ error: "Title, description, point cost, and file type are required" }, { status: 400 });
    }

    // Determine perkType based on fileType if not provided
    let finalPerkType = perkType;
    if (!finalPerkType) {
      finalPerkType = fileType === 'text-reward' ? 'Recognition' : 'DigitalFile';
    }

    // For non-text rewards, fileUrl is required
    if (fileType !== 'text-reward' && !fileUrl) {
      return NextResponse.json({ error: "File URL is required for non-text rewards" }, { status: 400 });
    }

    // Find the creator by email (session uses email)
    const creator = await User.findOne({ email: session.user.email });
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Check if creator is verified
    if (!creator.instagram?.isVerified) {
      return NextResponse.json({ error: "Only verified creators can add vault items" }, { status: 403 });
    }

    // Create new vault item
    const vaultItem = new VaultItem({
      creatorId: creator._id,
      title: title.trim(),
      description: description.trim(),
      pointCost: parseInt(pointCost),
      fileUrl,
      fileType: fileType,
      perkType: finalPerkType,
      requiresFanInput: Boolean(requiresFanInput)
    });

    await vaultItem.save();

    // Notify followers about the new vault item
    try {
      const creatorWithFollowers = await User.findById(creator._id).populate('followersArray', '_id');
      const followerIds = creatorWithFollowers.followersArray.map(follower => follower._id);
      
      if (followerIds.length > 0) {
        await notifyFollowersNewVaultItem(
          creator._id, 
          creator.username || creator.name, 
          vaultItem.title, 
          vaultItem._id, 
          followerIds
        );
      }
    } catch (notificationError) {
      console.error('Error notifying followers about new vault item:', notificationError);
      // Don't fail the vault item creation if notification fails
    }

    return NextResponse.json({ 
      success: true, 
      message: "Vault item added successfully",
      item: vaultItem 
    });

  } catch (error) {
    console.error("Error adding vault item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(nextAuthConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the creator by email (session uses email)
    const creator = await User.findOne({ email: session.user.email });
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Fetch creator's vault items
    const vaultItems = await VaultItem.find({ 
      creatorId: creator._id,
      isActive: true 
    }).sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      items: vaultItems 
    });

  } catch (error) {
    console.error("Error fetching vault items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
