"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

const FollowButton = ({ creatorId, creatorName, initialFollowerCount = 0, onFollowChange, showFollowerCount = false }) => {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Don't show follow button if user is not logged in or is viewing their own profile
  const shouldShowButton = session && session.user.id !== creatorId;

  useEffect(() => {
    if (shouldShowButton) {
      checkFollowStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [creatorId, session]);

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/users/${creatorId}/follow`);
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!session) {
      toast.error('Please log in to follow creators');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${creatorId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
        
        // Call parent callback if provided
        if (onFollowChange) {
          onFollowChange(data.isFollowing, data.followerCount);
        }

        toast.success(data.message, {
          icon: data.action === 'followed' ? '🎉' : '👋'
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!shouldShowButton) return null;

  if (checkingStatus) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-pulse bg-text/20 h-9 w-20 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleFollowToggle}
        disabled={loading}
        className={`
          px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 min-w-[90px]
          ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          ${isFollowing 
            ? 'bg-text/10 text-text border border-text/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20' 
            : 'bg-primary text-white hover:bg-primary/90 shadow-lg'
          }
        `}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 rounded-full border-2 border-current border-t-transparent"></div>
            <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
          </div>
        ) : (
          <span className="flex items-center gap-1">
            {isFollowing ? (
              <>
                <span>✓</span>
                Following
              </>
            ) : (
              <>
                <span>+</span>
                Follow
              </>
            )}
          </span>
        )}
      </button>
      
      {/* Follower count display - only show if explicitly requested and not creator's own page */}
      {showFollowerCount && followerCount > 0 && (
        <span className="text-sm text-text/60">
          {followerCount.toLocaleString()} follower{followerCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default FollowButton;
