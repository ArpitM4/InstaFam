import PointTransaction from '@/models/PointTransaction';
import ExpiredPoints from '@/models/ExpiredPoints';
import User from '@/models/User';
import { createNotification } from '@/utils/notificationHelpers';

/**
 * Spend points using FIFO (First In, First Out) algorithm
 * Uses oldest unexpired points first for a SPECIFIC CREATOR
 * @param {ObjectId} userId - The fan's user ID
 * @param {ObjectId} creatorId - The creator whose points to spend
 * @param {number} pointsToSpend - Amount of points to spend
 * @param {string} reason - Description for the transaction
 */
export async function spendPoints(userId, creatorId, pointsToSpend, reason = 'Points spent') {
  try {
    // Validate inputs
    const validPointsToSpend = typeof pointsToSpend === 'number' && !isNaN(pointsToSpend) && pointsToSpend > 0 ? pointsToSpend : 0;

    if (!userId || !creatorId || validPointsToSpend <= 0) {
      throw new Error('Invalid userId, creatorId, or pointsToSpend value');
    }

    const now = new Date();

    // Get available unexpired points for THIS CREATOR, sorted by expiration (oldest first)
    const availablePoints = await PointTransaction.find({
      userId,
      creatorId, // Filter by creator
      type: { $in: ['Earned', 'Bonus', 'Refund'] },
      expired: { $ne: true },
      used: { $ne: true },
      $or: [
        { expiresAt: { $gt: now } },
        { expiresAt: { $exists: false } },
        { expiresAt: null }
      ]
    }).sort({ expiresAt: 1, createdAt: 1 });

    // Calculate total available
    const totalAvailable = availablePoints.reduce((sum, tx) => {
      const points = tx.amount || tx.points_earned || 0;
      return sum + (typeof points === 'number' && !isNaN(points) ? points : 0);
    }, 0);

    if (totalAvailable < validPointsToSpend) {
      throw new Error('Insufficient points');
    }

    let remainingToSpend = validPointsToSpend;
    const usedTransactions = [];

    // Use points from oldest to newest (FIFO)
    for (const transaction of availablePoints) {
      if (remainingToSpend <= 0) break;

      const txAmount = transaction.amount || transaction.points_earned || 0;
      if (txAmount <= 0) continue;

      if (remainingToSpend >= txAmount) {
        // Use entire transaction
        transaction.used = true;
        await transaction.save();
        usedTransactions.push(transaction._id);
        remainingToSpend -= txAmount;
      } else {
        // Split transaction - use partial amount
        if (transaction.amount !== undefined) {
          transaction.amount = txAmount - remainingToSpend;
        }
        if (transaction.points_earned !== undefined) {
          transaction.points_earned = txAmount - remainingToSpend;
        }
        await transaction.save();

        // Create record for used portion
        const usedTx = new PointTransaction({
          userId,
          creatorId,
          amount: remainingToSpend,
          type: transaction.type,
          source_payment_id: transaction.source_payment_id,
          used: true,
          expired: false,
          expiresAt: transaction.expiresAt,
          createdAt: transaction.createdAt
        });
        await usedTx.save();
        usedTransactions.push(usedTx._id);
        remainingToSpend = 0;
      }
    }

    // Create a "Spent" transaction record
    const spentTransaction = new PointTransaction({
      userId,
      creatorId,
      amount: -validPointsToSpend,
      type: 'Spent',
      description: reason,
      used: false,
      expired: false,
      expiresAt: null
    });
    await spentTransaction.save();

    return {
      success: true,
      spentAmount: validPointsToSpend,
      spentTransactionId: spentTransaction._id
    };
  } catch (error) {
    console.error('Error spending points:', error);
    throw error;
  }
}

/**
 * Calculate available (unexpired and unused) points for a user with a SPECIFIC CREATOR
 * @param {ObjectId} userId - The fan's user ID
 * @param {ObjectId} creatorId - The creator to check points for
 */
export async function getAvailablePoints(userId, creatorId) {
  try {
    const now = new Date();
    const availableTransactions = await PointTransaction.find({
      userId,
      creatorId,
      type: { $in: ['Earned', 'Bonus', 'Refund'] },
      expired: { $ne: true },
      used: { $ne: true },
      $or: [
        { expiresAt: { $gt: now } },
        { expiresAt: { $exists: false } },
        { expiresAt: null }
      ]
    });

    return availableTransactions.reduce((sum, tx) => {
      const points = tx.amount || tx.points_earned || 0;
      return sum + (typeof points === 'number' && !isNaN(points) && points > 0 ? points : 0);
    }, 0);
  } catch (error) {
    console.error('Error calculating available points:', error);
    return 0;
  }
}

/**
 * Get all points grouped by creator for a user
 * @param {ObjectId} userId - The fan's user ID
 * @returns {Array} Array of { creatorId, creatorUsername, creatorProfilePic, points, expiringPoints }
 */
export async function getPointsByCreator(userId) {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Aggregate points by creator
    const pointsByCreator = await PointTransaction.aggregate([
      {
        $match: {
          userId: userId,
          type: { $in: ['Earned', 'Bonus', 'Refund'] },
          expired: { $ne: true },
          used: { $ne: true },
          $or: [
            { expiresAt: { $gt: now } },
            { expiresAt: { $exists: false } },
            { expiresAt: null }
          ]
        }
      },
      {
        $group: {
          _id: '$creatorId',
          totalPoints: {
            $sum: { $ifNull: ['$amount', { $ifNull: ['$points_earned', 0] }] }
          },
          expiringPoints: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$expiresAt', null] },
                    { $lte: ['$expiresAt', thirtyDaysFromNow] }
                  ]
                },
                { $ifNull: ['$amount', { $ifNull: ['$points_earned', 0] }] },
                0
              ]
            }
          },
          nextExpiry: { $min: '$expiresAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $unwind: '$creator'
      },
      {
        $project: {
          creatorId: '$_id',
          creatorUsername: '$creator.username',
          creatorName: '$creator.name',
          creatorProfilePic: '$creator.profilepic',
          points: '$totalPoints',
          expiringPoints: '$expiringPoints',
          nextExpiry: '$nextExpiry'
        }
      },
      {
        $sort: { points: -1 }
      }
    ]);

    return pointsByCreator;
  } catch (error) {
    console.error('Error getting points by creator:', error);
    return [];
  }
}

/**
 * Get points that are expiring soon for a specific creator
 * @param {ObjectId} userId - The fan's user ID
 * @param {ObjectId} creatorId - The creator to check
 * @param {number} daysAhead - Number of days to look ahead (default 30)
 */
export async function getExpiringPoints(userId, creatorId, daysAhead = 30) {
  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const query = {
      userId,
      type: { $in: ['Earned', 'Bonus', 'Refund'] },
      expired: false,
      used: false,
      expiresAt: {
        $gt: now,
        $lte: futureDate
      }
    };

    // Add creatorId filter if provided
    if (creatorId) {
      query.creatorId = creatorId;
    }

    const expiringPoints = await PointTransaction.find(query)
      .populate('creatorId', 'username name profilepic')
      .sort({ expiresAt: 1 });

    const totalExpiring = expiringPoints.reduce((sum, tx) => sum + (tx.amount || tx.points_earned || 0), 0);

    return {
      transactions: expiringPoints,
      totalExpiring
    };
  } catch (error) {
    console.error('Error getting expiring points:', error);
    return { transactions: [], totalExpiring: 0 };
  }
}

/**
 * Process expired points for all users
 * Should be run daily via cron job
 */
export async function processExpiredPoints() {
  try {
    const now = new Date();
    console.log('Processing expired points at:', now);

    // Find expired transactions (group by user AND creator)
    const expiredTransactions = await PointTransaction.find({
      type: { $in: ['Earned', 'Bonus', 'Refund'] },
      expired: false,
      used: false,
      expiresAt: { $lt: now }
    });

    console.log(`Found ${expiredTransactions.length} expired transactions`);

    // Group by user AND creator
    const userCreatorExpiries = {};
    for (const tx of expiredTransactions) {
      const key = `${tx.userId}_${tx.creatorId}`;
      if (!userCreatorExpiries[key]) {
        userCreatorExpiries[key] = {
          userId: tx.userId,
          creatorId: tx.creatorId,
          total: 0,
          transactions: []
        };
      }

      userCreatorExpiries[key].total += tx.amount || tx.points_earned || 0;
      userCreatorExpiries[key].transactions.push(tx._id);

      // Mark as expired
      tx.expired = true;
      await tx.save();
    }

    // Process each user-creator combination
    for (const [key, data] of Object.entries(userCreatorExpiries)) {
      if (data.total > 0) {
        // Create expired points record
        const expiredRecord = new ExpiredPoints({
          userId: data.userId,
          creatorId: data.creatorId,
          pointsExpired: data.total,
          originalTransactions: data.transactions
        });
        await expiredRecord.save();

        // Create negative transaction for expired points
        const expiryTx = new PointTransaction({
          userId: data.userId,
          creatorId: data.creatorId,
          amount: -data.total,
          type: 'Expired',
          relatedTransactions: data.transactions,
          description: `${data.total} points expired after 60 days`
        });
        await expiryTx.save();

        // Send notification
        try {
          const creator = await User.findById(data.creatorId).select('username');
          await createNotification({
            recipientId: data.userId,
            type: 'points_expired',
            title: `${data.total} FamPoints expired`,
            message: `${data.total} of your FamPoints for ${creator?.username || 'a creator'} have expired after 60 days.`
          });
        } catch (notifError) {
          console.error('Error sending expiry notification:', notifError);
        }
      }
    }

    console.log('Expired points processing completed');
    return {
      processedCombinations: Object.keys(userCreatorExpiries).length,
      totalExpired: Object.values(userCreatorExpiries).reduce((sum, data) => sum + data.total, 0)
    };
  } catch (error) {
    console.error('Error processing expired points:', error);
    throw error;
  }
}

/**
 * Send warning notifications for points expiring soon
 */
export async function sendExpiryWarnings(daysAhead = 7) {
  try {
    const now = new Date();
    const warningDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    // Group by user AND creator
    const expiringTransactions = await PointTransaction.aggregate([
      {
        $match: {
          type: { $in: ['Earned', 'Bonus', 'Refund'] },
          expired: false,
          used: false,
          expiresAt: {
            $gt: now,
            $lte: warningDate
          }
        }
      },
      {
        $group: {
          _id: { userId: '$userId', creatorId: '$creatorId' },
          totalExpiring: { $sum: { $ifNull: ['$amount', '$points_earned'] } },
          earliestExpiry: { $min: '$expiresAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.creatorId',
          foreignField: '_id',
          as: 'creator'
        }
      },
      { $unwind: '$creator' }
    ]);

    console.log(`Sending expiry warnings for ${expiringTransactions.length} user-creator combinations`);

    for (const item of expiringTransactions) {
      try {
        // Calculate actual days remaining from earliest expiry
        const daysRemaining = Math.ceil((new Date(item.earliestExpiry) - now) / (1000 * 60 * 60 * 24));

        await createNotification({
          recipientId: item._id.userId,
          type: 'points_expiring_soon',
          title: `${item.totalExpiring} FamPoints expiring soon!`,
          message: `${item.totalExpiring} of your FamPoints for ${item.creator.username} will expire in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Use them in their Vault!`
        });
      } catch (notifError) {
        console.error('Error sending expiry warning:', notifError);
      }
    }

    return { warningsSent: expiringTransactions.length };
  } catch (error) {
    console.error('Error sending expiry warnings:', error);
    throw error;
  }
}

