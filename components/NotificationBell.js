"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/actions/notificationActions';
import { FaCommentDots, FaGift, FaBullhorn, FaMoneyBillWave, FaUserPlus, FaCalendarAlt, FaLockOpen, FaBell, FaCheckCircle, FaTimesCircle, FaClock, FaHourglassHalf, FaUndo } from 'react-icons/fa';

const NotificationBell = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    if (session) {
      loadNotifications();
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !bellRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    if (!session) return;

    setLoading(true);
    try {
      const data = await fetchNotifications(1, 10);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification._id);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notification._id
            ? { ...n, isRead: true }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Handle notification-specific actions
    handleNotificationAction(notification);
  };

  const handleNotificationAction = (notification) => {
    switch (notification.type) {
      case 'creator_answered':
        // Redirect to My Fam Points page
        window.location.href = '/my-fam-points';
        break;
      case 'vault_redeemed':
        // Redirect to Dashboard Requests
        window.location.href = '/creator/requests';
        break;
      case 'creator_event_started':
      case 'creator_new_vault_item':
        // Redirect to creator's payment page
        let creatorUsername = null;

        // Try to get username from notification data
        if (notification.data?.creatorName) {
          creatorUsername = notification.data.creatorName;
        } else if (notification.senderId) {
          // Fallback: if we have senderId but no creatorName, we might need to fetch the username
          // For now, we'll try using the senderId as a fallback (though this won't work as a URL)
          console.warn('No creatorName in notification data, using senderId as fallback');
          creatorUsername = notification.senderId;
        }

        if (creatorUsername) {
          window.location.href = `/${creatorUsername}`;
        } else {
          console.error('Could not determine creator username from notification:', notification);
        }
        setIsOpen(false);
        break;
      case 'system_message':
        // Just close the dropdown for system messages
        setIsOpen(false);
        break;
      default:
        setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'creator_answered':
        return <FaCommentDots className="text-blue-400" />;
      case 'vault_redeemed':
        return <FaGift className="text-pink-400" />;
      case 'redemption_fulfilled':
        return <FaCheckCircle className="text-green-400" />;
      case 'redemption_rejected':
        return <FaTimesCircle className="text-red-400" />;
      case 'redemption_cancelled':
      case 'vault_request_expired':
      case 'vault_request_refunded':
        return <FaUndo className="text-orange-400" />;
      case 'system_message':
        return <FaBullhorn className="text-yellow-400" />;
      case 'payment_received':
        return <FaMoneyBillWave className="text-green-400" />;
      case 'new_follower':
        return <FaUserPlus className="text-purple-400" />;
      case 'creator_event_started':
        return <FaCalendarAlt className="text-orange-400" />;
      case 'creator_new_vault_item':
        return <FaLockOpen className="text-cyan-400" />;
      case 'creator_free_vault_item':
        return <FaGift className="text-primary" />;
      case 'points_expiring_soon':
        return <FaHourglassHalf className="text-amber-400" />;
      case 'points_expired':
        return <FaClock className="text-red-400" />;
      case 'vault_request_expiring_soon':
        return <FaClock className="text-amber-400" />;
      default:
        return <FaBell className="text-gray-400" />;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (!session) return null;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 bg-background/95 backdrop-blur-xl text-white border border-white/10 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-semibold text-lg text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!notification.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-1 text-white">
                        {notification.title}
                      </p>
                      <p className="text-gray-400 text-sm mb-2">
                        {notification.message}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Could navigate to a full notifications page in the future
                }}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
