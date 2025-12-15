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
    const user = await User.findOne({ username }).select("socials favourites").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Serialize ObjectIds to strings for client components
    const serializedSocials = (user.socials || []).map(social => ({
      ...social,
      _id: social._id.toString(),
      createdAt: social.createdAt?.toISOString()
    }));

    const serializedFavourites = (user.favourites || []).map(fav => ({
      ...fav,
      _id: fav._id.toString(),
      createdAt: fav.createdAt?.toISOString()
    }));

    const response = NextResponse.json({
      socials: serializedSocials,
      favourites: serializedFavourites
    });

    // Cache for 2 minutes - links don't change frequently
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');

    return response;
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
    // Destructure all potential fields
    const {
      type, // 'social', 'favourite' (top level type distinction from frontend)
      // Social/Link fields:
      linkType, // 'social' | 'other' (sub-type for socials array)
      platform, title, username, description, icon, color, url,
      // Product fields:
      name, image, price, currency, couponCode, imagePosition
    } = body;

    // "type" here refers to the collection array: 'social' (which now means Links) or 'favourite' (Products)
    if (!type || !["social", "favourite"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const user = await User.findOne({ username: session.user.name });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (type === "social") {
      // This handles both "Social Media" and "Other" links
      if (!url) {
        return NextResponse.json({ error: "Link URL is required" }, { status: 400 });
      }

      const newLink = {
        type: linkType || 'social',
        link: url,
        color: color || '#1a1a1a' // Default dark color
      };

      if (linkType === 'other') {
        if (!title) return NextResponse.json({ error: "Title is required for custom links" }, { status: 400 });
        newLink.title = title;
        newLink.description = description;
        newLink.icon = icon;
      } else {
        // Standard Social
        if (!platform) return NextResponse.json({ error: "Platform is required" }, { status: 400 });
        newLink.platform = platform;
        newLink.username = username || ''; // Username is optional now
      }

      user.socials.push(newLink);

    } else if (type === "favourite") {
      if (!name || !url || !image) {
        return NextResponse.json({ error: "Name, Link and Image are required" }, { status: 400 });
      }

      user.favourites.push({
        name,
        description,
        link: url,
        image,
        price: price ? parseFloat(price) : null,
        currency: currency || 'INR',
        couponCode,
        imagePosition,
        color: color || '#1a1a1a'
      });
    }

    await user.save();

    return NextResponse.json({
      success: true,
      socials: serializeList(user.socials),
      favourites: serializeList(user.favourites)
    });
  } catch (error) {
    console.error("Error adding link:", error);
    return NextResponse.json({ error: "Failed to add link" }, { status: 500 });
  }
}

// PUT - Update an existing social or favourite
export async function PUT(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id, type, // id of item, type of collection ('social' or 'favourite')
      // Fields to update...

      linkType, platform, title, username, description, url, icon, color,
      name, image, price, currency, couponCode, imagePosition
    } = body;

    if (!id || !type) {
      return NextResponse.json({ error: "ID and Type required" }, { status: 400 });
    }

    const user = await User.findOne({ username: session.user.name });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (type === 'social') {
      const item = user.socials.id(id);
      if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

      // Update fields
      if (url) item.link = url;
      if (color) item.color = color;
      if (linkType) item.type = linkType;

      if (item.type === 'other') {
        if (title) item.title = title;
        if (description !== undefined) item.description = description;
        if (icon) item.icon = icon;
      } else {
        if (platform) item.platform = platform;
        if (username !== undefined) item.username = username;
      }
    } else if (type === 'favourite') {
      const item = user.favourites.id(id);
      if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

      if (name) item.name = name;
      if (description !== undefined) item.description = description;
      if (url) item.link = url;
      if (image) item.image = image;
      if (price !== undefined) item.price = price ? parseFloat(price) : null;
      if (currency) item.currency = currency;
      if (color) item.color = color;
      if (couponCode !== undefined) item.couponCode = couponCode;
      if (imagePosition) item.imagePosition = imagePosition;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      socials: serializeList(user.socials),
      favourites: serializeList(user.favourites)
    });
  } catch (error) {
    console.error("Error updating link:", error);
    return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
  }
}

// Helper to serialize Mongoose lists
const serializeList = (list) => {
  return list.map(item => {
    const obj = item.toObject ? item.toObject() : item;
    obj._id = obj._id.toString();
    obj.createdAt = obj.createdAt?.toISOString();
    return obj;
  });
};

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

    // Serialize the returned data
    const serializedSocials = user.socials.map(social => ({
      platform: social.platform,
      username: social.username,
      link: social.link,
      _id: social._id.toString(),
      createdAt: social.createdAt?.toISOString()
    }));

    const serializedFavourites = user.favourites.map(fav => ({
      name: fav.name,
      link: fav.link,
      image: fav.image,
      _id: fav._id.toString(),
      createdAt: fav.createdAt?.toISOString()
    }));

    return NextResponse.json({
      success: true,
      socials: serializedSocials,
      favourites: serializedFavourites
    });
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}

// PATCH - Reorder socials or favourites
export async function PATCH(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, orderedIds } = body;

    if (!type || !["social", "favourite"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
    }

    const user = await User.findOne({ username: session.user.name });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Reorder the appropriate array
    if (type === "social") {
      // Create a map for quick lookup
      const itemMap = new Map(user.socials.map(item => [item._id.toString(), item]));

      // Reorder based on orderedIds
      const reordered = orderedIds
        .map(id => itemMap.get(id))
        .filter(item => item !== undefined);

      // Keep any items that weren't in orderedIds at the end (safety)
      const remainingItems = user.socials.filter(item => !orderedIds.includes(item._id.toString()));

      user.socials = [...reordered, ...remainingItems];
    } else if (type === "favourite") {
      const itemMap = new Map(user.favourites.map(item => [item._id.toString(), item]));

      const reordered = orderedIds
        .map(id => itemMap.get(id))
        .filter(item => item !== undefined);

      const remainingItems = user.favourites.filter(item => !orderedIds.includes(item._id.toString()));

      user.favourites = [...reordered, ...remainingItems];
    }

    await user.save();

    return NextResponse.json({
      success: true,
      socials: serializeList(user.socials),
      favourites: serializeList(user.favourites)
    });
  } catch (error) {
    console.error("Error reordering:", error);
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
