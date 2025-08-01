"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Hardcoded admin emails - should match the API
const ADMIN_EMAILS = ['arpitmahatpure@gmail.com', 'arpitmaurya1506@gmail.com', 'chiragbhandarlap@gmail.com'];

const AdminBlogActions = ({ blog, onDelete }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if user is admin
  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

  // Don't render anything if not admin
  if (!isAdmin) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/blogs?id=${blog._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Blog post deleted successfully!");
        setShowDeleteConfirm(false);
        
        // Call onDelete callback if provided (for list pages)
        if (onDelete) {
          onDelete(blog._id);
        } else {
          // Redirect to blogs page if no callback (for individual blog pages)
          router.push('/blogs');
        }
      } else {
        toast.error(data.error || "Failed to delete blog post");
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error("Error deleting blog post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Edit Button (placeholder for future implementation) */}
      <button
        onClick={() => toast.info("Edit functionality coming soon!")}
        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors"
        title="Edit blog post"
      >
        ✏️ Edit
      </button>

      {/* Delete Button */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors"
        title="Delete blog post"
      >
        🗑️ Delete
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dropdown-hover rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-text mb-4">Delete Blog Post?</h3>
            <p className="text-text/70 mb-6">
              Are you sure you want to delete "{blog.title}"? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 bg-text/10 hover:bg-text/20 text-text px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogActions;
