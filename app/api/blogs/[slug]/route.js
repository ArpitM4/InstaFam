import { NextResponse } from "next/server";
import connectDB from "@/db/ConnectDb";
import Blog from "@/models/Blog";

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { slug } = params;
    
    const blog = await Blog.findOne({ slug })
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
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}
