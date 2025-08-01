"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Hardcoded admin emails - Update this array with your admin emails
const ADMIN_EMAILS = ['arpitmahatpure@gmail.com', 'arpitmaurya1506@gmail.com', 'chiragbhandarlap@gmail.com']; // Add your admin emails here

const UploadBlogPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: ""
  });

  // Check if user is admin
  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Blog post created successfully!");
        setFormData({ title: "", content: "" });
        router.push('/blogs');
      } else {
        toast.error(data.error || "Failed to create blog post");
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast.error("Error creating blog post");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <div className="text-center bg-dropdown-hover rounded-xl p-8 max-w-md mx-4">
          <h1 className="text-2xl font-bold text-primary mb-4">Authentication Required</h1>
          <p className="text-text/70 mb-6">Please log in to access this page.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <div className="text-center bg-dropdown-hover rounded-xl p-8 max-w-md mx-4">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-primary mb-4">Access Denied</h1>
          <p className="text-text/70 mb-6">
            You don't have admin privileges to access this page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 text-text py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-text/20 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Create New Blog Post</h1>
          <p className="text-text/70">Share knowledge with the creator community</p>
        </div>

        {/* Blog Creation Form */}
        <div className="bg-dropdown-hover rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-lg font-medium text-text">
                Blog Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter an engaging title for your blog post..."
                className="w-full px-4 py-3 bg-background border border-text/20 rounded-xl text-text placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Content Textarea */}
            <div className="space-y-2">
              <label htmlFor="content" className="block text-lg font-medium text-text">
                Blog Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write your blog content here... You can use line breaks for formatting."
                rows={15}
                className="w-full px-4 py-3 bg-background border border-text/20 rounded-xl text-text placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-vertical"
                disabled={isLoading}
              />
              <p className="text-sm text-text/60">
                Tip: Use line breaks to separate paragraphs and make your content more readable.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
                className="bg-primary hover:bg-primary/90 disabled:bg-text/20 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Publishing...
                  </>
                ) : (
                  'Publish Blog Post'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/blogs')}
                disabled={isLoading}
                className="bg-text/10 hover:bg-text/20 text-text px-8 py-3 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        {(formData.title.trim() || formData.content.trim()) && (
          <div className="mt-8 bg-dropdown-hover rounded-xl p-8">
            <h3 className="text-xl font-bold text-primary mb-4">Preview</h3>
            <div className="bg-background rounded-xl p-6 space-y-4">
              {formData.title.trim() && (
                <h4 className="text-2xl font-bold text-text">{formData.title}</h4>
              )}
              {formData.content.trim() && (
                <div className="text-text/80 whitespace-pre-wrap leading-relaxed">
                  {formData.content}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadBlogPage;
