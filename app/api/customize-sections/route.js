import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";
import connectDB from "@/db/ConnectDb";

// GET - Fetch user's visible sections
export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    const user = await User.findOne({ username }).select("visibleSections").lean();
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response = NextResponse.json({
      visibleSections: user.visibleSections || ['contribute', 'vault', 'links']
    });
    
    // Cache for 2 minutes - profile customization doesn't change frequently
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    
    return response;
  } catch (error) {
    console.error("Error fetching visible sections:", error);
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
  }
}

// POST - Update user's visible sections
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { visibleSections } = body;

    if (!Array.isArray(visibleSections)) {
      return NextResponse.json({ error: "Invalid sections format" }, { status: 400 });
    }

    // Validate sections
    const validSections = ['contribute', 'vault', 'links', 'merchandise', 'community', 'subscription', 'courses', 'giveaway'];
    const invalidSections = visibleSections.filter(s => !validSections.includes(s));
    
    if (invalidSections.length > 0) {
      return NextResponse.json({ error: "Invalid section names" }, { status: 400 });
    }

    // Find the user by session username
    const user = await User.findOne({ username: session.user.name });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update visible sections
    user.visibleSections = visibleSections;
    await user.save();

    return NextResponse.json({ 
      success: true, 
      visibleSections: user.visibleSections
    });
  } catch (error) {
    console.error("Error updating visible sections:", error);
    return NextResponse.json({ error: "Failed to update sections" }, { status: 500 });
  }
}
