import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/db/ConnectDb";
import Blog from "@/models/Blog";

// Helper function to format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Server Component to fetch single blog
async function getBlog(slug) {
  try {
    await connectDB();
    
    const blog = await Blog.findOne({ slug })
      .populate('authorId', 'name username')
      .lean();
    
    if (!blog) {
      return null;
    }
    
    // Convert MongoDB ObjectIds to strings for Next.js serialization
    const serializedBlog = {
      ...blog,
      _id: blog._id.toString(),
      authorId: {
        ...blog.authorId,
        _id: blog.authorId._id.toString()
      },
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString()
    };
    
    return serializedBlog;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const blog = await getBlog(params.slug);
  
  if (!blog) {
    return {
      title: 'Blog Not Found - Creator School',
      description: 'The requested blog post could not be found.'
    };
  }
  
  return {
    title: `${blog.title} - Creator School`,
    description: blog.content.substring(0, 160) + (blog.content.length > 160 ? '...' : ''),
  };
}

const SingleBlogPage = async ({ params }) => {
  const blog = await getBlog(params.slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background pt-20 text-text py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center gap-2 text-sm text-text/60">
            <Link 
              href="/blogs" 
              className="hover:text-primary transition-colors"
            >
              Creator School
            </Link>
            <span>→</span>
            <span className="text-text/80">{blog.title}</span>
          </div>
        </nav>

        {/* Article Header */}
        <header className="mb-12 pb-8 border-b border-text/20">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 leading-tight">
            {blog.title}
          </h1>
          
          {/* Author and Date Information */}
          <div className="flex items-center gap-6 text-text/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-lg">
                  {(blog.authorId.name || blog.authorId.username).charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-text">
                  {blog.authorId.name || blog.authorId.username}
                </p>
                <p className="text-sm text-text/60">Author</p>
              </div>
            </div>
            
            <div className="h-8 w-px bg-text/20"></div>
            
            <div>
              <p className="font-medium text-text">{formatDate(blog.createdAt)}</p>
              <p className="text-sm text-text/60">Published</p>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <div className="bg-dropdown-hover rounded-xl p-8 md:p-12">
            <div className="text-text/90 leading-relaxed whitespace-pre-wrap text-lg">
              {blog.content}
            </div>
          </div>
        </article>

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-text/20">
          <div className="bg-dropdown-hover rounded-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Found this helpful?
                </h3>
                <p className="text-text/70">
                  Join thousands of creators building their audience and income.
                </p>
              </div>
              
              <div className="flex gap-4">
                <Link
                  href="/explore"
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Explore Creators
                </Link>
                <Link
                  href="/blogs"
                  className="bg-text/10 hover:bg-text/20 text-text px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  More Articles
                </Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Back to Blogs */}
        <div className="text-center mt-8">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-text/70 hover:text-primary transition-colors"
          >
            ← Back to Creator School
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SingleBlogPage;
