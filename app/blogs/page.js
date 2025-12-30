"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminBlogActions from "@/components/AdminBlogActions";
import SEO from "@/components/SEO";

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

// Helper function to create excerpt - strips markdown syntax
function createExcerpt(content, maxLength = 150) {
  // Remove markdown syntax for a clean excerpt
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove heading markers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
    .replace(/`(.*?)`/g, '$1') // Remove inline code markers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove link markdown, keep text
    .replace(/>\s+/g, '') // Remove blockquote markers
    .replace(/[-*+]\s+/g, '') // Remove list markers
    .replace(/\d+\.\s+/g, '') // Remove numbered list markers
    .replace(/\n+/g, ' ') // Replace line breaks with spaces
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + '...';
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
      <>
        <SEO
          title="Loading Creator School - Content Creation Education"
          description="Loading creator education content, tutorials, and strategies for content creators and influencers."
          keywords="creator education, content creation tutorials, influencer tips, loading"
        />
        <div className="min-h-screen bg-background pt-20 text-text flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text/70">Loading Creator School...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Creator School - Learn Content Creation & Influencer Marketing"
        description="Master content creation with Sygil's Creator School. Free tutorials, proven strategies, and expert tips to grow your audience, increase engagement, and monetize your content as a successful creator."
        keywords="creator school, content creation course, influencer marketing, social media strategy, creator education, content marketing tips, audience growth, monetization strategies, creator economy, influencer tips"
        url="https://www.sygil.app/blogs"
        image="https://www.sygil.app/og-creator-school.jpg"
        type="website"
      />

      <div className="min-h-screen bg-background pt-20 text-text py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header with SEO-optimized structure */}
          <header className="border-b border-text/20 pb-6 mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-primary mb-2">Creator School</h1>
                <p className="text-text/70 text-lg">Learn, grow, and master the art of content creation with expert tutorials and proven strategies</p>
              </div>

              {/* Admin Quick Access - Hidden link for admins */}
              <Link
                href="/upload-blog"
                className="text-text/50 hover:text-primary text-sm transition-colors"
                aria-label="Admin access for blog content management"
              >
                Admin Access
              </Link>
            </div>
          </header>

          {/* Main content with proper semantic structure */}
          <main role="main">
            {/* JSON-LD for Blog section */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "Blog",
                  "name": "Sygil Creator School",
                  "description": "Educational content for content creators and influencers",
                  "url": "https://www.sygil.app/blogs",
                  "publisher": {
                    "@type": "Organization",
                    "name": "Sygil",
                    "logo": {
                      "@type": "ImageObject",
                      "url": "https://www.sygil.app/logo.png"
                    }
                  }
                })
              }}
            />

            {blogs.length === 0 ? (
              <section className="text-center py-16" aria-labelledby="coming-soon-heading">
                <h2 id="coming-soon-heading" className="text-2xl font-bold text-primary mb-4">Coming Soon</h2>
                <p className="text-text/70 max-w-md mx-auto">
                  We're creating comprehensive educational content to help you become a successful creator.
                  Stay tuned for expert insights, proven strategies, and actionable tutorials!
                </p>
              </section>
            ) : (
              <section className="grid gap-6" aria-labelledby="articles-heading">
                <h2 id="articles-heading" className="sr-only">Latest Creator Education Articles</h2>
                {blogs.map((blog, index) => {
                  const blogUrl = `https://www.sygil.app/blogs/${blog.slug}`;
                  const publishDate = new Date(blog.createdAt).toISOString();

                  return (
                    <article
                      key={blog._id}
                      className="group bg-dropdown-hover rounded-xl p-4 hover:bg-dropdown-hover/80 transition-colors"
                      itemScope
                      itemType="https://schema.org/BlogPosting"
                    >
                      {/* Structured data for each blog post */}
                      <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                          __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "BlogPosting",
                            "headline": blog.title,
                            "description": createExcerpt(blog.content, 160),
                            "url": blogUrl,
                            "datePublished": publishDate,
                            "dateModified": new Date(blog.updatedAt).toISOString(),
                            "author": {
                              "@type": "Person",
                              "name": blog.authorId.name || blog.authorId.username
                            },
                            "publisher": {
                              "@type": "Organization",
                              "name": "Sygil",
                              "logo": {
                                "@type": "ImageObject",
                                "url": "https://www.sygil.app/logo.png"
                              }
                            },
                            "mainEntityOfPage": {
                              "@type": "WebPage",
                              "@id": blogUrl
                            }
                          })
                        }}
                      />

                      <Link href={`/blogs/${blog.slug}`} className="block">
                        <div className="space-y-3">
                          {/* Featured Badge for First Post */}
                          {index === 0 && (
                            <div className="inline-flex items-center px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                              ⭐ Featured Article
                            </div>
                          )}

                          {/* Title with proper heading hierarchy */}
                          <h3
                            className="text-xl font-semibold text-text group-hover:text-text/80 transition-colors leading-tight"
                            itemProp="headline"
                          >
                            {blog.title}
                          </h3>

                          {/* Excerpt with proper semantic meaning */}
                          <p
                            className="text-text/70 leading-relaxed text-sm"
                            itemProp="description"
                          >
                            {createExcerpt(blog.content, 120)}
                          </p>

                          {/* Meta Information with structured data */}
                          <div className="flex items-center justify-between pt-3 border-text/10">
                            <div className="flex items-center gap-3 text-xs text-text/60">
                              <span
                                className="font-medium"
                                itemProp="author"
                                itemScope
                                itemType="https://schema.org/Person"
                              >
                                <span itemProp="name">{blog.authorId.name || blog.authorId.username}</span>
                              </span>
                              <span aria-hidden="true">•</span>
                              <time
                                dateTime={blog.createdAt}
                                itemProp="datePublished"
                                title={`Published on ${formatDate(blog.createdAt)}`}
                              >
                                {formatDate(blog.createdAt)}
                              </time>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-primary font-medium text-xs group-hover:gap-3 transition-all">
                                <span>Read Article</span>
                                <span className="group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
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
                  );
                })}
              </section>
            )}
          </main>

          {/* Call to Action with better SEO structure */}
          {blogs.length > 0 && (
            <aside className="mt-40 text-center bg-background py-2 border-t-gray-600 border-t-2 rounded-none" role="complementary">
              <h2 className="text-xl font-bold text-text mb-4">
                Ready to Start Your Creator Journey?
              </h2>
              <p className="text-text/70 mb-6 max-w-xl mx-auto">
                Join thousands of creators who are building their audience and growing their income.
                Explore our creator community and start earning today!
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-3 py-3 rounded-xl font-medium transition-colors"
                aria-label="Explore creators and join the community"
              >
                Explore Creators
                <span aria-hidden="true">🚀</span>
              </Link>
            </aside>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogsPage;
