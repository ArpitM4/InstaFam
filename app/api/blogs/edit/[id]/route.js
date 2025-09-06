import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/ConnectDb";
import Blog from "@/models/Blog";

// Hardcoded admin emails - should match other API routes
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []; // Updated to use NEXT_PUBLIC_ADMIN_EMAILS

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(nextAuthConfig);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin check
  if (!ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const { id } = params;
    
    const blog = await Blog.findById(id)
      .populate('authorId', 'name username');
    
    if (!blog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Error fetching blog for edit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}
