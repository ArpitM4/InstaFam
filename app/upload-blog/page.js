"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";

// Dynamically import SimpleMDE to avoid SSR issues
const SimpleMdeReact = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-background border border-text/20 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-text/60 text-sm">Loading editor...</p>
      </div>
    </div>
  ),
});

// Import SimpleMDE CSS
import "easymde/dist/easymde.min.css";
import ReactMarkdown from 'react-markdown';

// Hardcoded admin emails - Update this array with your admin emails
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];

const UploadBlogPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBlog, setIsLoadingBlog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: ""
  });
  
  // Check if we're in edit mode
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  // Check if user is admin
  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  // Fetch blog data if in edit mode
  useEffect(() => {
    if (isEditMode && editId && isAdmin) {
      fetchBlogForEdit(editId);
    }
  }, [isEditMode, editId, isAdmin]);

  const fetchBlogForEdit = async (blogId) => {
    try {
      setIsLoadingBlog(true);
      const response = await fetch(`/api/blogs/edit/${blogId}`);
      const data = await response.json();

      if (data.success) {
        setFormData({
          title: data.blog.title,
          content: data.blog.content
        });
      } else {
        toast.error(data.error || "Failed to load blog for editing");
        router.push('/blogs');
      }
    } catch (error) {
      console.error('Error fetching blog for edit:', error);
      toast.error("Error loading blog for editing");
      router.push('/blogs');
    } finally {
      setIsLoadingBlog(false);
    }
  };

  // SimpleMDE options
  const simpleMdeOptions = useMemo(() => ({
    placeholder: `Start writing your blog post here...

Examples of what you can do:
# Main Heading
## Sub Heading
**Bold text** and *italic text*
- Bullet points
1. Numbered lists
> Quotes
[Link text](https://example.com)
\`inline code\` and code blocks

Use the toolbar above for easy formatting!`,
    spellChecker: false,
    status: ["lines", "words", "cursor"],
    tabSize: 2,
    toolbar: [
      "bold", "italic", "heading", "|",
      "quote", "unordered-list", "ordered-list", "|",
      "link", "image", "|",
      "preview", "side-by-side", "fullscreen", "|",
      "guide"
    ],
    shortcuts: {
      "toggleBold": "Ctrl-B",
      "toggleItalic": "Ctrl-I",
      "drawLink": "Ctrl-K",
      "togglePreview": "Ctrl-P",
      "toggleSideBySide": "F9",
      "toggleFullScreen": "F11"
    },
    renderingConfig: {
      singleLineBreaks: false,
      codeSyntaxHighlighting: true,
    }
  }), []);

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
      const url = '/api/blogs';
      const method = isEditMode ? 'PUT' : 'POST';
      const body = isEditMode 
        ? {
            id: editId,
            title: formData.title.trim(),
            content: formData.content.trim()
          }
        : {
            title: formData.title.trim(),
            content: formData.content.trim()
          };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        const successMessage = isEditMode ? "Blog post updated successfully!" : "Blog post created successfully!";
        toast.success(successMessage);
        
        if (isEditMode) {
          // Redirect to the updated blog post
          router.push(`/blogs/${data.blog.slug}`);
        } else {
          // Clear form and redirect to blogs list for new posts
          setFormData({ title: "", content: "" });
          router.push('/blogs');
        }
      } else {
        const errorMessage = isEditMode ? "Failed to update blog post" : "Failed to create blog post";
        toast.error(data.error || errorMessage);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} blog post:`, error);
      toast.error(`Error ${isEditMode ? 'updating' : 'creating'} blog post`);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoadingBlog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text/70">
            {isLoadingBlog ? "Loading blog for editing..." : "Loading..."}
          </p>
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
          <h1 className="text-3xl font-bold text-primary mb-2">
            {isEditMode ? "Edit Blog Post" : "Create New Blog Post"}
          </h1>
          <p className="text-text/70">
            {isEditMode ? "Update your blog post content" : "Share knowledge with the creator community"}
          </p>
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

            {/* Content Editor */}
            <div className="space-y-2">
              <label htmlFor="content" className="block text-lg font-medium text-text">
                Blog Content
              </label>
              <div className="markdown-editor">
                <SimpleMdeReact
                  value={formData.content}
                  onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                  options={simpleMdeOptions}
                />
              </div>
              <p className="text-sm text-text/60">
                💡 <strong>Markdown Tips:</strong> Use **bold**, *italic*, # headings, &gt; quotes, [links](url), and `code`. 
                Press F9 for side-by-side preview or F11 for fullscreen editing.
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
                    {isEditMode ? "Updating..." : "Publishing..."}
                  </>
                ) : (
                  isEditMode ? "Update Blog Post" : "Publish Blog Post"
                )}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (isEditMode) {
                    router.back(); // Go back to the previous page (likely the blog post)
                  } else {
                    router.push('/blogs'); // Go to blogs list
                  }
                }}
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
            <div className="bg-background rounded-xl p-6">
              <article className="prose prose-invert lg:prose-xl max-w-none">
                {formData.title.trim() && (
                  <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight mb-6">
                    {formData.title}
                  </h1>
                )}
                {formData.content.trim() && (
                  <div className="text-text/90">
                    <ReactMarkdown>
                      {formData.content}
                    </ReactMarkdown>
                  </div>
                )}
              </article>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrapper component to handle Suspense for useSearchParams
const UploadBlogPageWrapper = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text/70">Loading...</p>
        </div>
      </div>
    }>
      <UploadBlogPage />
    </Suspense>
  );
};

export default UploadBlogPageWrapper;
