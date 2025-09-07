import PointTransaction from '@/models/PointTransaction';
import ExpiredPoints from '@/models/ExpiredPoints';
import User from '@/models/User';
import { createNotification } from '@/utils/notificationHelpers';

/**
 * Spend points using FIFO (First In, First Out) algorithm
 * Uses oldest unexpired points first
 */
export async function spendPoints(userId, pointsToSpend, reason = 'Points spent') {
  try {
    // Debug logging
    console.log('🔍 spendPoints ENTRY:', { userId, pointsToSpend, reason, type: typeof pointsToSpend, timestamp: new Date().toISOString() });
    
    // Validate input and ensure pointsToSpend is a valid number
    const validPointsToSpend = typeof pointsToSpend === 'number' && !isNaN(pointsToSpend) && pointsToSpend > 0 ? pointsToSpend : 0;
    
    if (!userId || validPointsToSpend <= 0) {
      throw new Error('Invalid userId or pointsToSpend value');
    }

    console.log('🔍 spendPoints: Getting available points...');
    
    // Get available unexpired points, sorted by expiration (oldest first)
    const now = new Date();
    const availablePoints = await PointTransaction.find({
      userId,
      type: { $in: ['Earned', 'Bonus', 'Refund'] },
      expired: { $ne: true }, // Handle missing expired field
      used: { $ne: true }, // Handle missing used field
      $or: [
        { expiresAt: { $gt: now } }, // Has expiry date and not expired
        { expiresAt: { $exists: false } }, // Old transactions without expiry
        { expiresAt: null } // Transactions with null expiry
      ]
    }).sort({ expiresAt: 1, createdAt: 1 });

    console.log('🔍 spendPoints: Found transactions count:', availablePoints.length);

    // Calculate total available with validation
    const totalAvailable = availablePoints.reduce((sum, tx) => {
      // Handle backward compatibility: use amount field first, then fallback to points_earned
      const points = tx.amount || tx.points_earned || 0;
      const amount = typeof points === 'number' && !isNaN(points) ? points : 0;
      return sum + amount;
    }, 0);

    console.log('🔍 spendPoints: Total available points:', totalAvailable);

    if (totalAvailable < validPointsToSpend) {
      throw new Error('Insufficient points');
    }

    let remainingToSpend = validPointsToSpend;
    const usedTransactions = [];

    console.log('🔍 spendPoints: Starting FIFO loop...');

    // Use points from oldest to newest
    for (const transaction of availablePoints) {
      if (remainingToSpend <= 0) break;

      console.log('🔍 spendPoints: Processing transaction:', { 
        transactionId: transaction._id, 
        amount: transaction.amount, 
        points_earned: transaction.points_earned,
        remainingToSpend 
      });

      // Validate transaction amount with backward compatibility
      const points = transaction.amount || transaction.points_earned || 0;
      const txAmount = typeof points === 'number' && !isNaN(points) ? points : 0;
      if (txAmount <= 0) continue;

      console.log('🔍 spendPoints: Transaction amount:', txAmount, 'Remaining to spend:', remainingToSpend);

      if (remainingToSpend >= txAmount) {
        console.log('🔍 spendPoints: Using entire transaction');
        // Use entire transaction
        transaction.used = true;
        await transaction.save();
        usedTransactions.push(transaction._id);
        remainingToSpend -= txAmount;
      } else {
        console.log('🔍 spendPoints: SPLITTING TRANSACTION - Partial use');
        console.log('🔍 spendPoints: Original amount:', txAmount, 'Will use:', remainingToSpend, 'Will remain:', txAmount - remainingToSpend);
        
        // Split transaction - use partial amount
        const originalAmount = txAmount;
        
        // Update the correct field based on which one was used
        if (transaction.amount !== undefined && transaction.amount !== null) {
          console.log('🔍 spendPoints: Updating amount field');
          transaction.amount = txAmount - remainingToSpend;
        } else if (transaction.points_earned !== undefined && transaction.points_earned !== null) {
          console.log('🔍 spendPoints: Updating points_earned field and setting amount for validation');
          transaction.points_earned = txAmount - remainingToSpend;
          // Also set amount field for validation compliance
          transaction.amount = txAmount - remainingToSpend;
        }
        await transaction.save();

        // Create record for used portion with validation
        const usedAmount = remainingToSpend;
        console.log('Creating split transaction:', { 
          usedAmount, 
          remainingToSpend, 
          originalAmount: txAmount, 
          type: typeof usedAmount,
          isNaN: isNaN(usedAmount)
        });
        
        if (usedAmount > 0 && !isNaN(usedAmount)) {
          const transactionData = {
            userId,
            amount: usedAmount, // Always use the new amount field for new transactions
            type: transaction.type, // Preserve original type (Earned, Bonus, or Refund)
            source_payment_id: transaction.source_payment_id,
            used: true,
            expired: false,
            expiresAt: transaction.expiresAt,
            createdAt: transaction.createdAt
          };
          
          console.log('Split transaction data:', transactionData);
          
          const usedTx = new PointTransaction(transactionData);
          await usedTx.save();
          usedTransactions.push(usedTx._id);
        }
        remainingToSpend = 0;
      }
    }

    // Mark used transactions
    for (const usedTxId of usedTransactions) {
      await PointTransaction.findByIdAndUpdate(usedTxId, { used: true });
    }

    // Create a "Spent" transaction record to show in user's history
    console.log('🔍 spendPoints: Creating Spent transaction record...');
    const spentTransaction = new PointTransaction({
      userId,
      amount: -validPointsToSpend, // Negative amount to show as debit
      type: 'Spent',
      description: reason, // Use the provided reason
      used: false, // This transaction itself is not "used", it represents the spending
      expired: false,
      expiresAt: null, // Spent transactions don't expire
      createdAt: new Date() // Use current timestamp
    });
    
    console.log('🔍 spendPoints: Spent transaction data:', {
      userId: spentTransaction.userId,
      amount: spentTransaction.amount,
      type: spentTransaction.type,
      description: spentTransaction.description,
      used: spentTransaction.used
    });
    
    await spentTransaction.save();
    console.log('🔍 spendPoints: Spent transaction saved with ID:', spentTransaction._id);

    // Update user's total points with validation
    const user = await User.findById(userId);
    if (user) {
      const currentPoints = typeof user.points === 'number' && !isNaN(user.points) ? user.points : 0;
      user.points = Math.max(0, currentPoints - validPointsToSpend);
      await user.save();
    }

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
 * Calculate available (unexpired and unused) points for a user
 */
export async function getAvailablePoints(userId) {
  try {
    const now = new Date();
    const availableTransactions = await PointTransaction.find({
      userId,
      type: { $in: ['Earned', 'Bonus', 'Refund'] }, // Only count positive transaction types
      expired: { $ne: true }, // Handle missing expired field
      used: { $ne: true }, // Handle missing used field
      $or: [
        { expiresAt: { $gt: now } }, // Has expiry date and not expired
        { expiresAt: { $exists: false } }, // Old transactions without expiry
        { expiresAt: null } // Transactions with null expiry
      ]
    });

    return availableTransactions.reduce((sum, tx) => {
      // Handle backward compatibility: use amount field first, then fallback to points_earned
      const points = tx.amount || tx.points_earned || 0;
      const amount = typeof points === 'number' && !isNaN(points) && points > 0 ? points : 0;
      return sum + amount;
    }, 0);
  } catch (error) {
    console.error('Error calculating available points:', error);
    return 0;
  }
}

/**
 * Get points that are expiring soon (within specified days)
 */
export async function getExpiringPoints(userId, daysAhead = 30) {
  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const expiringPoints = await PointTransaction.find({
      userId,
      type: 'Earned',
      expired: false,
      used: false,
      expiresAt: {
        $gt: now,
        $lte: futureDate
      }
    }).sort({ expiresAt: 1 });

    return {
      transactions: expiringPoints,
      totalExpiring: expiringPoints.reduce((sum, tx) => sum + tx.amount, 0)
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

    // Find expired transactions
    const expiredTransactions = await PointTransaction.find({
      type: 'Earned',
      expired: false,
      used: false,
      expiresAt: { $lt: now }
    });

    console.log(`Found ${expiredTransactions.length} expired transactions`);

    // Group by user
    const userExpiries = {};
    for (const tx of expiredTransactions) {
      const userId = tx.userId.toString();
      if (!userExpiries[userId]) {
        userExpiries[userId] = {
          total: 0,
          transactions: []
        };
      }

      userExpiries[userId].total += tx.amount;
      userExpiries[userId].transactions.push(tx._id);

      // Mark as expired
      tx.expired = true;
      await tx.save();
    }

    // Process each user's expired points
    for (const [userId, data] of Object.entries(userExpiries)) {
      if (data.total > 0) {
        console.log(`Processing ${data.total} expired points for user ${userId}`);

        // Create expired points record
        const expiredRecord = new ExpiredPoints({
          userId,
          pointsExpired: data.total,
          originalTransactions: data.transactions
        });
        await expiredRecord.save();

        // Create negative transaction for expired points
        const expiryTx = new PointTransaction({
          userId,
          amount: -data.total,
          type: 'Expired',
          relatedTransactions: data.transactions,
          description: `${data.total} points expired after 60 days`
        });
        await expiryTx.save();

        // Update user's total points
        const user = await User.findById(userId);
        if (user) {
          user.points = Math.max(0, (user.points || 0) - data.total);
          await user.save();
        }

        // Send notification to user
        try {
          await createNotification({
            recipientId: userId,
            type: 'points_expired',
            title: `${data.total} FamPoints have expired`,
            message: `${data.total} of your FamPoints have expired after 60 days of inactivity. Use your points before they expire!`
          });
        } catch (notifError) {
          console.error('Error sending expiry notification:', notifError);
        }
      }
    }

    console.log('Expired points processing completed');
    return { processedUsers: Object.keys(userExpiries).length, totalExpired: Object.values(userExpiries).reduce((sum, user) => sum + user.total, 0) };
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

    // Find users with points expiring soon
    const expiringTransactions = await PointTransaction.aggregate([
      {
        $match: {
          type: 'Earned',
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
          _id: '$userId',
          totalExpiring: { $sum: '$amount' },
          earliestExpiry: { $min: '$expiresAt' }
        }
      }
    ]);

    console.log(`Sending expiry warnings to ${expiringTransactions.length} users`);

    for (const userExpiry of expiringTransactions) {
      try {
        await createNotification({
          recipientId: userExpiry._id,
          type: 'points_expiring_soon',
          title: `${userExpiry.totalExpiring} FamPoints expiring soon!`,
          message: `${userExpiry.totalExpiring} of your FamPoints will expire in ${daysAhead} days. Use them before ${userExpiry.earliestExpiry.toLocaleDateString()}!`
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
