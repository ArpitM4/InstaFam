import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";
import connectDB from "@/db/ConnectDb";

// GET - Fetch user's socials and favourites (PUBLIC - no auth required)
export async function GET(req) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Find user and return their socials and favourites (no auth check for GET)
    const user = await User.findOne({ username }).select("socials favourites");
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      socials: user.socials || [],
      favourites: user.favourites || []
    });
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}

// POST - Add a new social or favourite
export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, platform, username, link, name, image } = body;

    // Validate type (social or favourite)
    if (!type || !["social", "favourite"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Find the user by session username
    const user = await User.findOne({ username: session.user.name });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add social or favourite based on type
    if (type === "social") {
      if (!platform || !username || !link) {
        return NextResponse.json({ error: "Missing required fields for social" }, { status: 400 });
      }
      
      user.socials.push({ platform, username, link });
    } else if (type === "favourite") {
      if (!name || !link) {
        return NextResponse.json({ error: "Missing required fields for favourite" }, { status: 400 });
      }
      
      user.favourites.push({ name, link, image });
    }

    await user.save();

    return NextResponse.json({ 
      success: true, 
      socials: user.socials,
      favourites: user.favourites
    });
  } catch (error) {
    console.error("Error adding link:", error);
    return NextResponse.json({ error: "Failed to add link" }, { status: 500 });
  }
}

// DELETE - Remove a social or favourite
export async function DELETE(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id || !["social", "favourite"].includes(type)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Find the user by session username
    const user = await User.findOne({ username: session.user.name });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove the item based on type
    if (type === "social") {
      user.socials = user.socials.filter(social => social._id.toString() !== id);
    } else if (type === "favourite") {
      user.favourites = user.favourites.filter(fav => fav._id.toString() !== id);
    }

    await user.save();

    return NextResponse.json({ 
      success: true,
      socials: user.socials,
      favourites: user.favourites
    });
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}
