import Notification from '@/models/Notification';
import connectDB from '@/db/ConnectDb';

export const createNotification = async ({
  recipientId,
  senderId = null,
  type,
  title,
  message,
  data = {}
}) => {
  try {
    await connectDB();

    const notification = new Notification({
      recipientId,
      senderId,
      type,
      title,
      message,
      data
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Specific notification creators
// Specific notification creators
export const notifyCreatorAnswered = async (fanId, creatorName, vaultItemTitle, redemptionId) => {
  return await createNotification({
    recipientId: fanId,
    type: 'creator_answered',
    title: 'Your question has been answered!',
    message: `${creatorName} answered your question about "${vaultItemTitle}"`,
    data: { redemptionId, vaultItemTitle }
  });
};

export const notifyRedemptionFulfilled = async (fanId, creatorName, vaultItemTitle, redemptionId) => {
  return await createNotification({
    recipientId: fanId,
    type: 'redemption_fulfilled',
    title: 'Your request has been fulfilled!',
    message: `${creatorName} fulfilled your request for "${vaultItemTitle}"`,
    data: { redemptionId, vaultItemTitle }
  });
};

export const notifyVaultRedeemed = async (creatorId, fanName, vaultItemTitle, redemptionId, type = 'file') => {
  let title = 'New vault redemption!';
  let message = `${fanName} redeemed "${vaultItemTitle}"`;

  if (type === 'qna') {
    title = 'New Question Received!';
    message = `${fanName} asked a question in "${vaultItemTitle}". Reply now!`;
  } else if (type === 'promise') {
    title = 'New Service Request!';
    message = `${fanName} requested "${vaultItemTitle}". Check details.`;
  }

  return await createNotification({
    recipientId: creatorId,
    type: 'vault_redeemed',
    title,
    message,
    data: { redemptionId, vaultItemTitle, fanName, type }
  });
};

export const notifySystemMessage = async (recipientId, title, message, data = {}) => {
  return await createNotification({
    recipientId,
    type: 'system_message',
    title,
    message,
    data
  });
};

export const notifyPaymentReceived = async (creatorId, fanName, amount, paymentId) => {
  return await createNotification({
    recipientId: creatorId,
    type: 'payment_received',
    title: 'Payment received!',
    message: `${fanName} sent you $${amount}`,
    data: { paymentId, amount, fanName }
  });
};



// Follow system notifications
export const notifyNewFollower = async (creatorId, fanId, fanName) => {
  return await createNotification({
    recipientId: creatorId,
    senderId: fanId,
    type: 'new_follower',
    title: 'New follower!',
    message: `${fanName} started following you`,
    data: { fanId, fanName }
  });
};

// Event & Vault notifications for followers
export const notifyFollowersNewEvent = async (creatorId, creatorName, followers) => {
  if (!followers || followers.length === 0) return [];

  const notifications = [];

  for (const followerId of followers) {
    try {
      const notification = await createNotification({
        recipientId: followerId,
        senderId: creatorId,
        type: 'creator_event_started',
        title: 'New event started!',
        message: `${creatorName} has started a new event! Join now to earn points.`,
        data: { creatorId, creatorName }
      });
      if (notification) notifications.push(notification);
    } catch (error) {
      console.error(`Error notifying follower ${followerId}:`, error);
    }
  }

  return notifications;
};

export const notifyFollowersNewVaultItem = async (creatorId, creatorName, vaultItemTitle, vaultItemId, followers) => {
  if (!followers || followers.length === 0) return [];

  const notifications = [];

  for (const followerId of followers) {
    try {
      const notification = await createNotification({
        recipientId: followerId,
        senderId: creatorId,
        type: 'creator_new_vault_item',
        title: 'New vault item available!',
        message: `${creatorName} added a new item to their vault: "${vaultItemTitle}"`,
        data: { creatorId, creatorName, vaultItemTitle, vaultItemId }
      });
      if (notification) notifications.push(notification);
    } catch (error) {
      console.error(`Error notifying follower ${followerId}:`, error);
    }
  }

  return notifications;
};
