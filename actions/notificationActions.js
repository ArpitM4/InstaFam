// Client-side notification actions
export const fetchNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unreadOnly: unreadOnly.toString()
    });

    const response = await fetch(`/api/notifications?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { notifications: [], unreadCount: 0, hasMore: false };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false };
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await fetch('/api/notifications/mark-all-read', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false };
  }
};
