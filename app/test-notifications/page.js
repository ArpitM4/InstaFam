"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function TestNotifications() {
  const [status, setStatus] = useState('');
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === 'loading') {
      setStatus('Loading session...');
    } else if (!session) {
      setStatus('❌ Not logged in. Please log in to test notifications.');
    } else {
      setStatus(`✅ Logged in as: ${session.user?.email || session.user?.name || 'User'}`);
    }
  }, [session, sessionStatus]);

  const createTestNotification = async () => {
    if (!session) {
      setStatus('❌ Please log in first to create notifications.');
      return;
    }

    setStatus('Creating test notification...');
    console.log('Session user:', session.user); // Debug log
    try {
      const requestBody = {
        recipientId: session.user.id, // Use actual logged-in user ID
        type: 'system_message',
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working!',
        data: { testData: 'example' }
      };
      
      console.log('Request body:', requestBody); // Debug log

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Notification created:', result); // Debug log
        setStatus(`✅ Test notification created successfully! ID: ${result.notification?._id}. Check the notification bell.`);
      } else {
        const errorText = await response.text();
        setStatus(`Failed to create test notification. Status: ${response.status}. Error: ${errorText}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const fetchNotifications = async () => {
    if (!session) {
      setStatus('❌ Please log in first to fetch notifications.');
      return;
    }

    setStatus('Fetching notifications...');
    console.log('Fetching for user:', session.user); // Debug log
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const result = await response.json();
        console.log('Fetch result:', result); // Debug log
        setStatus(`Found ${result.notifications?.length || 0} notifications, ${result.unreadCount || 0} unread`);
        console.log('Notifications:', result.notifications);
      } else {
        const errorText = await response.text();
        console.log('Fetch error:', errorText); // Debug log
        setStatus(`Failed to fetch notifications. Status: ${response.status}. Error: ${errorText}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const testDatabaseConnection = async () => {
    setStatus('Testing database connection...');
    try {
      const response = await fetch('/api/test-notifications');
      if (response.ok) {
        const result = await response.json();
        setStatus(`✅ Database connected! Total notifications: ${result.totalNotifications}`);
      } else {
        const errorText = await response.text();
        setStatus(`❌ Database connection failed. Status: ${response.status}. Error: ${errorText}`);
      }
    } catch (error) {
      setStatus(`❌ Database test error: ${error.message}`);
    }
  };

  const createTestNotificationDirect = async () => {
    setStatus('Creating test notification (direct)...');
    try {
      const response = await fetch('/api/test-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: 'test-user-123',
          type: 'system_message',
          title: 'Direct Test Notification',
          message: 'This is a direct test notification without authentication!',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setStatus(`✅ Direct test notification created! ID: ${result.notification.id}`);
      } else {
        const errorText = await response.text();
        setStatus(`❌ Failed to create direct notification. Status: ${response.status}. Error: ${errorText}`);
      }
    } catch (error) {
      setStatus(`❌ Direct test error: ${error.message}`);
    }
  };

  const showAllNotifications = async () => {
    setStatus('Fetching all notifications from database...');
    try {
      const response = await fetch('/api/test-notifications/all');
      if (response.ok) {
        const result = await response.json();
        console.log('All notifications:', result.notifications);
        setStatus(`📋 Total notifications in DB: ${result.notifications?.length || 0}. Check console for details.`);
      } else {
        const errorText = await response.text();
        setStatus(`❌ Failed to fetch all notifications. Status: ${response.status}. Error: ${errorText}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <h1 className="text-3xl font-bold mb-8">Test Notification System</h1>
      
      <div className="space-y-4">
        {/* Basic tests (no authentication required) */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Basic System Tests (No Login Required)</h3>
          <div className="space-x-2">
            <button
              onClick={testDatabaseConnection}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              Test Database Connection
            </button>
            
            <button
              onClick={createTestNotificationDirect}
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded"
            >
              Create Direct Test Notification
            </button>
            
            <button
              onClick={showAllNotifications}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Show All Notifications (Debug)
            </button>
          </div>
        </div>

        {/* Authenticated tests */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Authenticated Tests (Login Required)</h3>
          {!session ? (
            <div className="text-center p-6 bg-yellow-100 rounded-lg">
              <p className="text-lg mb-4">Please log in to test the authenticated notification system</p>
              <a href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Go to Login
              </a>
            </div>
          ) : (
            <div className="space-x-2">
              <button
                onClick={createTestNotification}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Create Test Notification
              </button>
              
              <button
                onClick={fetchNotifications}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Fetch Notifications
              </button>
            </div>
          )}
        </div>
        
        {status && (
          <div className="mt-4 text-black p-4 bg-gray-100 rounded">
            <p>{status}</p>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">System Status:</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>✅ Notification Model: Created with all required fields</li>
          <li>✅ API Endpoints: /api/notifications (GET/POST), /api/notifications/[id] (PUT), /api/notifications/mark-all-read (PUT)</li>
          <li>✅ NotificationBell Component: Added to Navbar with real-time polling</li>
          <li>✅ Helper Functions: Created for different notification types</li>
          <li>✅ Integration: Updated vault redemption and creator answer APIs</li>
          <li>✅ Follow System: Complete with database schema, API endpoints, and UI components</li>
          <li>✅ Follower Notifications: Event start and vault item notifications for followers</li>
        </ul>
        
        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          <h3 className="font-bold text-lg mb-2">🚀 Follow & Notification System Complete!</h3>
          <p className="mb-2">The comprehensive follow system is now live with these features:</p>
          <ul className="list-disc pl-6 text-sm">
            <li>User schema updated with followersArray and following fields</li>
            <li>Follow/unfollow API with real-time status updates</li>
            <li>FollowButton component integrated into creator profiles</li>
            <li>Automatic notifications for new followers, events, and vault items</li>
            <li>Future-proof notification system for admin messages</li>
          </ul>
          <p className="mt-3 font-semibold">
            🧪 <a href="/test-follow" className="text-blue-600 hover:underline">Test the Follow System</a>
          </p>
        </div>
      </div>
    </div>
  );
}
