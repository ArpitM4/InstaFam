import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/ConnectDb";
import Blog from "@/models/Blog";
import User from "@/models/User";
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Hardcoded admin emails - Update this array with your admin emails
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];

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

    // Revalidate the blogs page to show the new post immediately
    try {
      revalidatePath('/blogs');
    } catch (revalidateError) {
      console.log('Revalidation failed:', revalidateError);
      // Continue anyway as the blog was created successfully
    }

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

// PUT - Update blog post (Admin Only)
export async function PUT(request) {
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

    const { id, title, content } = await request.json();

    if (!id || !title || !content) {
      return NextResponse.json(
        { success: false, error: 'Blog ID, title, and content are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the existing blog post
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Generate new slug if title changed
    let slug = existingBlog.slug;
    if (existingBlog.title !== title.trim()) {
      slug = generateSlug(title.trim());
      
      // Check if new slug already exists (excluding current blog)
      const existingSlug = await Blog.findOne({ 
        slug: slug,
        _id: { $ne: id }
      });
      
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Update the blog post
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        content: content.trim(),
        slug: slug,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('authorId', 'name username');

    // Revalidate the blogs page to show the updated post immediately
    try {
      revalidatePath('/blogs');
      revalidatePath(`/blogs/${slug}`);
    } catch (revalidateError) {
      console.log('Revalidation failed:', revalidateError);
      // Continue anyway as the blog was updated successfully
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully',
      blog: updatedBlog
    });

  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog post (Admin Only)
export async function DELETE(request) {
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

    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('id');

    if (!blogId) {
      return NextResponse.json(
        { success: false, error: 'Blog ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find and delete the blog post
    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    if (!deletedBlog) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Revalidate the blogs page to reflect the deletion immediately
    try {
      revalidatePath('/blogs');
    } catch (revalidateError) {
      console.log('Revalidation failed:', revalidateError);
      // Continue anyway as the blog was deleted successfully
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
      deletedBlog: {
        _id: deletedBlog._id,
        title: deletedBlog.title,
        slug: deletedBlog.slug
      }
    });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
