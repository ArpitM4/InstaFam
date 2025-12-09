"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import PointsRewardPopup from './PointsRewardPopup';

const FollowButton = ({ creatorId, creatorName, initialFollowerCount = 0, onFollowChange, showFollowerCount = false }) => {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // State for optional reward popup
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Show follow button for guests or other users (not owner)
  const shouldShowButton = !session || session.user.id !== creatorId;

  useEffect(() => {
    if (shouldShowButton && creatorId) {
      checkFollowStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [creatorId, session?.user?.id]);

  const checkFollowStatus = async () => {
    if (!session) {
      setCheckingStatus(false);
      return; // Skip check for guests
    }
    try {
      console.log('Checking follow status for creator:', creatorId);
      const response = await fetch(`/api/users/${creatorId}/follow`);
      if (response.ok) {
        const data = await response.json();
        console.log('Follow status response:', data);
        setIsFollowing(data.isFollowing);
      } else {
        console.error('Failed to check follow status:', response.status);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!session) {
      window.dispatchEvent(new CustomEvent('open-auth-modal'));
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

        // Check for reward
        if (data.action === 'followed' && data.pointsEarned > 0) {
          setEarnedPoints(data.pointsEarned);
          setShowRewardPopup(true);
        } else {
          // Standard toast only if no popup is shown
          toast.success(data.message, {
            icon: data.action === 'followed' ? '🎉' : '👋'
          });
        }
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
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleFollowToggle}
          disabled={loading}
          className={`
            px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 min-w-[100px] shadow-md
            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'}
            ${isFollowing
              ? 'bg-white/10 text-text border border-white/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30'
              : 'btn-gradient text-white border-0'
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

      <PointsRewardPopup
        isOpen={showRewardPopup}
        onClose={() => setShowRewardPopup(false)}
        pointsEarned={earnedPoints}
        creatorName={creatorName}
      />
    </>
  );
};

export default FollowButton;
