import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/ConnectDb";
import Blog from "@/models/Blog";
import User from "@/models/User";

// Hardcoded admin emails - Update this array with your admin emails
const ADMIN_EMAILS = ['arpitmahatpure@gmail.com', 'arpitmaurya1506@gmail.com']; // Add your admin emails here

// Helper function to generate URL-friendly slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim('-'); // Remove leading/trailing hyphens
}

// GET - Fetch all blog posts (Public)
export async function GET() {
  try {
    await connectDB();
    
    const blogs = await Blog.find({})
      .populate('authorId', 'name username')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      blogs
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST - Create new blog post (Admin Only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
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

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the admin user
    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Generate slug
    let baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (await Blog.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create new blog post
    const newBlog = new Blog({
      title,
      content,
      slug,
      authorId: adminUser._id
    });

    await newBlog.save();

    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      blog: newBlog
    });

  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
