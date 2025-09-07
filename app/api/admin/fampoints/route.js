import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ConnectDb from '@/db/ConnectDb';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';
import Redemption from '@/models/Redemption';

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

    await ConnectDb();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const month = parseInt(searchParams.get('month')) || new Date().getMonth() + 1;
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear();

    // Build date filter
    let dateFilter = {};
    if (filter === 'month') {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };
    } else if (filter === 'year') {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };
    }

    const now = new Date();

    // Basic statistics
    const [
      totalGenerated,
      totalRedeemed,
      totalExpired,
      totalActive,
      usersWithPoints,
      recentTransactions
    ] = await Promise.all([
      // Total points generated (earned + bonus + refunds) - handle both amount and points_earned fields
      PointTransaction.aggregate([
        { 
          $match: { 
            $or: [
              { type: 'Earned' },
              { type: 'Bonus' },
              { type: 'Refund' },
              { type: { $exists: false } }, // Old records without type
              { type: null }
            ],
            ...dateFilter 
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { 
              $sum: {
                $ifNull: ['$amount', { $ifNull: ['$points_earned', 0] }]
              }
            } 
          } 
        }
      ]),

      // Total points redeemed (spent) - count all spent transaction amounts
      PointTransaction.aggregate([
        { 
          $match: { 
            type: 'Spent',
            ...dateFilter 
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { 
              $sum: { 
                $abs: {
                  $ifNull: ['$amount', { $ifNull: ['$points_earned', 0] }]
                }
              } 
            } 
          } 
        }
      ]),

      // Total points expired
      PointTransaction.aggregate([
        { $match: { type: 'Expired', ...dateFilter } },
        { $group: { _id: null, total: { $sum: { $abs: { $ifNull: ['$amount', 0] } } } } }
      ]),

      // Active points (not expired, not used) - including bonus and refunds
      PointTransaction.aggregate([
        { 
          $match: { 
            $or: [
              { type: 'Earned' },
              { type: 'Bonus' },
              { type: 'Refund' },
              { type: { $exists: false } },
              { type: null }
            ],
            $or: [
              { expired: false },
              { expired: { $exists: false } }
            ],
            $or: [
              { used: false },
              { used: { $exists: false } }
            ],
            $or: [
              { expiresAt: { $gt: now } },
              { expiresAt: { $exists: false } } // Old records without expiry
            ],
            ...dateFilter
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { 
              $sum: {
                $ifNull: ['$amount', { $ifNull: ['$points_earned', 0] }]
              }
            } 
          } 
        }
      ]),

      // Users with active points
      User.countDocuments({ points: { $gt: 0 } }),

      // Recent transactions with user info
      PointTransaction.aggregate([
        { $match: dateFilter },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $project: {
            type: 1,
            amount: { $ifNull: ['$amount', '$points_earned'] },
            description: 1,
            createdAt: 1,
            userEmail: { $arrayElemAt: ['$user.email', 0] }
          }
        }
      ])
    ]);

    // Expiry analytics - more flexible matching
    const [expiring7Days, expiring30Days, expiredThisMonth] = await Promise.all([
      // Points expiring in next 7 days
      PointTransaction.aggregate([
        {
          $match: {
            $or: [
              { type: 'Earned' },
              { type: 'Bonus' },
              { type: 'Refund' },
              { type: { $exists: false } }
            ],
            $or: [
              { expired: false },
              { expired: { $exists: false } }
            ],
            $or: [
              { used: false },
              { used: { $exists: false } }
            ],
            expiresAt: {
              $gt: now,
              $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            }
          }
        },
        { 
          $group: { 
            _id: null, 
            total: { 
              $sum: {
                $ifNull: ['$amount', { $ifNull: ['$points_earned', 0] }]
              }
            } 
          } 
        }
      ]),

      // Points expiring in next 30 days
      PointTransaction.aggregate([
        {
          $match: {
            $or: [
              { type: 'Earned' },
              { type: 'Bonus' },
              { type: 'Refund' },
              { type: { $exists: false } }
            ],
            $or: [
              { expired: false },
              { expired: { $exists: false } }
            ],
            $or: [
              { used: false },
              { used: { $exists: false } }
            ],
            expiresAt: {
              $gt: now,
              $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        { 
          $group: { 
            _id: null, 
            total: { 
              $sum: {
                $ifNull: ['$amount', { $ifNull: ['$points_earned', 0] }]
              }
            } 
          } 
        }
      ]),

      // Points expired this month
      PointTransaction.aggregate([
        {
          $match: {
            type: 'Expired',
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth(), 1),
              $lte: now
            }
          }
        },
        { 
          $group: { 
            _id: null, 
            total: { 
              $sum: { 
                $abs: {
                  $ifNull: ['$amount', 0]
                }
              } 
            } 
          } 
        }
      ])
    ]);

    // Calculate derived statistics
    const totalGen = totalGenerated[0]?.total || 0;
    const totalRed = totalRedeemed[0]?.total || 0;
    const totalAct = totalActive[0]?.total || 0;

    const stats = {
      totalGenerated: totalGen,
      totalRedeemed: totalRed,
      totalExpired: totalExpired[0]?.total || 0,
      totalActive: totalAct,
      usersWithPoints,
      expiringSoon: expiring30Days[0]?.total || 0,
      avgPointsPerUser: usersWithPoints > 0 ? Math.round(totalAct / usersWithPoints) : 0,
      redemptionRate: totalGen > 0 ? Math.round((totalRed / totalGen) * 100) : 0
    };

    const expiryAnalytics = {
      expiring7Days: expiring7Days[0]?.total || 0,
      expiring30Days: expiring30Days[0]?.total || 0,
      expiredThisMonth: expiredThisMonth[0]?.total || 0
    };

    return NextResponse.json({
      success: true,
      stats,
      expiryAnalytics,
      recentTransactions,
      filter: {
        type: filter,
        month: filter === 'month' ? month : null,
        year: filter !== 'all' ? year : null
      }
    });

  } catch (error) {
    console.error('FamPoints admin API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
