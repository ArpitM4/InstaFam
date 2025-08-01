"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import AdminBlogActions from "@/components/AdminBlogActions";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Force dynamic rendering for fresh blog content
export const dynamic = 'force-dynamic';

// Helper function to format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to calculate reading time
function calculateReadingTime(content) {
  // Remove markdown syntax and count words
  const plainText = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/>\s+/g, '')
    .replace(/[-*+]\s+/g, '')
    .replace(/\d+\.\s+/g, '')
    .replace(/\n+/g, ' ')
    .trim();
    
  const words = plainText.split(/\s+/).length;
  const avgWordsPerMinute = 200; // Average reading speed
  const readingTime = Math.ceil(words / avgWordsPerMinute);
  
  return readingTime;
}

const SingleBlogPage = () => {
  const params = useParams();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchBlog(params.slug);
    }
  }, [params.slug]);

  const fetchBlog = async (slug) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/blogs/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setBlog(data.blog);
      } else if (response.status === 404) {
        setNotFoundError(true);
      } else {
        console.error('Failed to fetch blog');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 text-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text/70">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (notFoundError || !blog) {
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
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight flex-1">
              {blog.title}
            </h1>
            
            {/* Admin Actions */}
            <div className="ml-6">
              <AdminBlogActions blog={blog} />
            </div>
          </div>
          
          {/* Author and Date Information */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-text/70">
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
            
            <div className="hidden sm:block h-8 w-px bg-text/20"></div>
            
            <div className="flex items-center gap-6">
              <div>
                <p className="font-medium text-text">{formatDate(blog.createdAt)}</p>
                <p className="text-sm text-text/60">Published</p>
              </div>
              
              <div className="h-6 w-px bg-text/20"></div>
              
              <div>
                <p className="font-medium text-text">{calculateReadingTime(blog.content)} min read</p>
                <p className="text-sm text-text/60">Reading time</p>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-invert lg:prose-xl max-w-none">
          <div className="bg-dropdown-hover rounded-xl p-8 md:p-12">
            <div className="text-text/90 leading-relaxed">
              <ReactMarkdown 
                components={{
                h1: ({children}) => <h1 className="text-3xl font-bold text-primary mb-6 mt-8 first:mt-0">{children}</h1>,
                h2: ({children}) => <h2 className="text-2xl font-bold text-primary mb-4 mt-6">{children}</h2>,
                h3: ({children}) => <h3 className="text-xl font-bold text-primary mb-3 mt-5">{children}</h3>,
                h4: ({children}) => <h4 className="text-lg font-bold text-primary mb-2 mt-4">{children}</h4>,
                p: ({children}) => <p className="text-text/90 mb-4 leading-relaxed">{children}</p>,
                ul: ({children}) => <ul className="list-disc list-inside mb-4 text-text/90 space-y-2">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside mb-4 text-text/90 space-y-2">{children}</ol>,
                li: ({children}) => <li className="text-text/90">{children}</li>,
                blockquote: ({children}) => (
                  <blockquote className="border-l-4 border-primary bg-dropdown-hover/50 p-4 my-6 italic text-text/80">
                    {children}
                  </blockquote>
                ),
                code: ({node, inline, className, children, ...props}) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  
                  return !inline && language ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={language}
                      PreTag="div"
                      className="rounded-lg !bg-dropdown-hover !p-4 !m-0 text-sm"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-dropdown-hover text-accent px-2 py-1 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({children}) => <pre className="bg-dropdown-hover p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                a: ({href, children}) => (
                  <a href={href} className="text-primary hover:text-primary/80 underline transition-colors" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                strong: ({children}) => <strong className="font-bold text-accent">{children}</strong>,
                em: ({children}) => <em className="italic text-secondary">{children}</em>,
              }}
              >
                {blog.content}
              </ReactMarkdown>
            </div>
          </div>
        </article>        {/* Article Footer */}
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
