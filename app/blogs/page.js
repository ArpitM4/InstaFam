"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminBlogActions from "@/components/AdminBlogActions";

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';

// Alternatively, you can use revalidate instead of force-dynamic
// export const revalidate = 0; // This will revalidate on every request

// Helper function to format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to create excerpt
function createExcerpt(content, maxLength = 150) {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
}

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/blogs');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
      } else {
        console.error('Failed to fetch blogs');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBlog = (deletedBlogId) => {
    setBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== deletedBlogId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 text-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text/70">Loading Creator School...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 text-text py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b border-text/20 pb-6 mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Creator School</h1>
              <p className="text-text/70">Learn, grow, and master the art of content creation</p>
            </div>
            
            {/* Admin Quick Access - Hidden link for admins */}
            <Link 
              href="/upload-blog" 
              className="text-text/50 hover:text-primary text-sm transition-colors"
            >
              Admin Access
            </Link>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {blogs.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-primary mb-4">Coming Soon</h2>
            <p className="text-text/70 max-w-md mx-auto">
              We're working on creating amazing content to help you become a better creator. 
              Stay tuned for insights, tips, and strategies!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {blogs.map((blog, index) => (
              <article
                key={blog._id}
                className="group bg-dropdown-hover rounded-xl p-4 hover:bg-dropdown-hover/80 transition-colors"
              >
                <Link href={`/blogs/${blog.slug}`} className="block">
                  <div className="space-y-3">
                    {/* Featured Badge for First Post */}
                    {index === 0 && (
                      <div className="inline-flex items-center px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                        ⭐ Featured
                      </div>
                    )}
                    
                    {/* Title */}
                    <h2 className="text-xl font-semibold text-text group-hover:text-text/80 transition-colors leading-tight">
                      {blog.title}
                    </h2>
                    
                    {/* Excerpt */}
                    <p className="text-text/70 leading-relaxed text-sm">
                      {createExcerpt(blog.content, 120)}
                    </p>
                    
                    {/* Meta Information */}
                    <div className="flex items-center justify-between pt-3  border-text/10">
                      <div className="flex items-center gap-3 text-xs text-text/60">
                        <span className="font-medium">
                          {blog.authorId.name || blog.authorId.username}
                        </span>
                        <span>•</span>
                        <span>{formatDate(blog.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-primary font-medium text-xs group-hover:gap-3 transition-all">
                          Read More
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                
                {/* Admin Actions - Outside the Link */}
                <div className="mt-4 border-text/20">
                  <AdminBlogActions blog={blog} onDelete={handleDeleteBlog} />
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {blogs.length > 0 && (
            <div className="mt-40 text-center bg-background py-2 border-t-gray-600 border-t-2 rounded-none">
            <h3 className="text-xl font-bold text-text mb-4">
              Want to Learn More?
            </h3>
            <p className="text-text/70 mb-6 max-w-xl mx-auto">
              Join thousands of creators who are building their audience and growing their income. 
              Start your journey today!
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-3 py-3 rounded-xl font-medium transition-colors"
            >
              Explore Creators
              <span>🚀</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsPage;
