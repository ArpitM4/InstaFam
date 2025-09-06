import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ConnectDb from '@/db/ConnectDb';
import User from '@/models/User';
import Bonus from '@/models/Bonus';
import Redemption from '@/models/Redemption';
import PointTransaction from '@/models/PointTransaction';

async function isAdminUser(email) {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !(await isAdminUser(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await ConnectDb();

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate + 'T23:59:59.999Z')
        }
      };
    } else if (range && range !== 'all') {
      const now = new Date();
      let startTime;
      
      switch (range) {
        case 'today':
          startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = null;
      }
      
      if (startTime) {
        dateFilter = { createdAt: { $gte: startTime } };
      }
    }

    // Fetch all analytics data
    const [
      totalUsers,
      totalCreators,
      verifiedCreators,
      unverifiedCreators,
      newUsers,
      newCreators,
      activeUsers,
      usersWithFollowers,
      totalBonuses,
      requestedBonuses,
      grantedBonuses,
      totalRedemptions,
      pendingRedemptions,
      completedRedemptions,
      totalPointsRedeemed,
      pendingOTPVerification,
      avgPointsData,
      avgRedemptionsData
    ] = await Promise.all([
      // User stats
      User.countDocuments(),
      User.countDocuments({ accountType: { $in: ['Creator', 'VCreator'] } }),
      User.countDocuments({ 
        accountType: { $in: ['Creator', 'VCreator'] },
        'instagram.isVerified': true 
      }),
      User.countDocuments({ 
        accountType: { $in: ['Creator', 'VCreator'] },
        'instagram.isVerified': { $ne: true }
      }),
      User.countDocuments(dateFilter),
      User.countDocuments({ 
        ...dateFilter, 
        accountType: { $in: ['Creator', 'VCreator'] } 
      }),
      User.countDocuments({ points: { $gt: 0 } }),
      User.countDocuments({ 'followersArray.0': { $exists: true } }),
      
      // Bonus stats
      Bonus.countDocuments(),
      Bonus.countDocuments({ status: 'Requested' }),
      Bonus.countDocuments({ status: 'Granted' }),
      
      // Redemption stats
      Redemption.countDocuments(),
      Redemption.countDocuments({ status: 'pending' }),
      Redemption.countDocuments({ status: 'completed' }),
      
      // Points stats
      PointTransaction.aggregate([
        { $match: { type: 'vault_redemption' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // OTP verification pending
      User.countDocuments({
        'instagram.otp': { $exists: true, $ne: null },
        'instagram.isVerified': { $ne: true }
      }),
      
      // Average calculations
      User.aggregate([
        { $group: { _id: null, avgPoints: { $avg: '$points' } } }
      ]),
      
      User.aggregate([
        { $match: { accountType: { $in: ['Creator', 'VCreator'] } } },
        { $lookup: { 
          from: 'redemptions', 
          localField: '_id', 
          foreignField: 'userId', 
          as: 'redemptions' 
        }},
        { $group: { 
          _id: null, 
          avgRedemptions: { $avg: { $size: '$redemptions' } } 
        }}
      ])
    ]);

    const analytics = {
      totalUsers,
      totalCreators,
      verifiedCreators,
      unverifiedCreators,
      newUsers,
      newCreators,
      activeUsers,
      usersWithFollowers,
      totalBonuses,
      requestedBonuses,
      grantedBonuses,
      totalRedemptions,
      pendingRedemptions,
      completedRedemptions,
      totalPointsRedeemed: totalPointsRedeemed[0]?.total || 0,
      pendingOTPVerification,
      avgPointsPerUser: avgPointsData[0]?.avgPoints || 0,
      avgRedemptionsPerCreator: avgRedemptionsData[0]?.avgRedemptions || 0
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Fetch analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
