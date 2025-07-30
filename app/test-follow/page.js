"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import FollowButton from '@/components/FollowButton';

export default function TestFollowSystem() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const response = await fetch('/api/explore');
      if (response.ok) {
        const data = await response.json();
        setCreators(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <h1 className="text-3xl font-bold mb-8">Test Follow System</h1>
      
      {!session ? (
        <div className="text-center p-6 bg-yellow-100 rounded-lg">
          <p className="text-lg mb-4">Please log in to test the follow system</p>
          <a href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Go to Login
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <h2 className="font-bold">✅ Follow System Features:</h2>
            <ul className="list-disc pl-6 mt-2">
              <li>✅ Updated User Schema with followersArray and following fields</li>
              <li>✅ Follow/Unfollow API endpoint: POST /api/users/:id/follow</li>
              <li>✅ FollowButton component with real-time status</li>
              <li>✅ Follower notifications (new_follower type)</li>
              <li>✅ Event notifications for followers (creator_event_started type)</li>
              <li>✅ Vault item notifications for followers (creator_new_vault_item type)</li>
              <li>✅ Integration with PaymentProfileSection</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Available Creators to Follow:</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                <p>Loading creators...</p>
              </div>
            ) : creators.length === 0 ? (
              <p className="text-gray-600">No verified creators found.</p>
            ) : (
              <div className="grid gap-4">
                {creators.map((creator) => (
                  <div key={creator._id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={creator.profilepic || "https://picsum.photos/60"}
                      alt="profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">@{creator.username}</h3>
                      <p className="text-sm text-gray-600">Creator</p>
                    </div>
                    <FollowButton
                      creatorId={creator._id}
                      creatorName={creator.username}
                      initialFollowerCount={creator.followers}
                      showFollowerCount={true} // Show for testing purposes
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <h3 className="font-bold">🧪 How to Test:</h3>
            <ol className="list-decimal pl-6 mt-2">
              <li>Click "Follow" on any creator above</li>
              <li>Check the creator's profile to see the updated follower count</li>
              <li>Check the notification bell - the creator should receive a "New follower" notification</li>
              <li>Have the creator start an event - you should receive an event notification</li>
              <li>Have the creator add a vault item - you should receive a vault notification</li>
              <li>Click "Following" to unfollow and test the unfollow flow</li>
            </ol>
          </div>

          <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded">
            <h3 className="font-bold">🔔 Notification Types Added:</h3>
            <ul className="list-disc pl-6 mt-2">
              <li><strong>new_follower:</strong> When someone follows you</li>
              <li><strong>creator_event_started:</strong> When a creator you follow starts an event</li>
              <li><strong>creator_new_vault_item:</strong> When a creator you follow adds a new vault item</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
