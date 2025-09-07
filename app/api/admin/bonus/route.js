import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ConnectDb from '@/db/ConnectDb';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';

async function isAdminUser(email) {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

export async function POST(request) {
  try {
    await ConnectDb();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await isAdminUser(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { identifier, points, description } = await request.json();

    // Validate input
    if (!identifier || !points || points <= 0) {
      return NextResponse.json({ 
        error: 'Please provide valid user identifier and positive points amount' 
      }, { status: 400 });
    }

    if (isNaN(points)) {
      return NextResponse.json({ 
        error: 'Points must be a valid number' 
      }, { status: 400 });
    }

    // Find user by username or user ID
    let user;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a MongoDB ObjectId
      user = await User.findById(identifier);
    } else {
      // It's a username
      user = await User.findOne({ username: identifier });
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found. Please check the username or user ID.' 
      }, { status: 404 });
    }

    // Create bonus point transaction with expiry
    const bonusExpiryDate = new Date();
    bonusExpiryDate.setDate(bonusExpiryDate.getDate() + 60); // 60 days expiry

    const bonusTransaction = await PointTransaction.create({
      userId: user._id,
      type: 'Bonus',
      amount: Number(points),
      description: description || `Admin bonus points awarded`,
      expiresAt: bonusExpiryDate,
      expired: false,
      used: false
    });

    // Update user's total points
    await User.findByIdAndUpdate(
      user._id,
      { $inc: { points: Number(points) } },
      { new: true }
    );

    // Get updated user data
    const updatedUser = await User.findById(user._id).select('username email points');

    return NextResponse.json({
      success: true,
      message: `Successfully awarded ${points} FamPoints to ${user.username}`,
      data: {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          totalPoints: updatedUser.points
        },
        transaction: {
          id: bonusTransaction._id,
          amount: bonusTransaction.amount,
          description: bonusTransaction.description,
          expiresAt: bonusTransaction.expiresAt,
          createdAt: bonusTransaction.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Admin bonus error:', error);
    return NextResponse.json(
      { error: 'Failed to award bonus points', details: error.message },
      { status: 500 }
    );
  }
}

// Get recent bonus transactions
export async function GET(request) {
  try {
    await ConnectDb();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await isAdminUser(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get recent bonus transactions
    const recentBonuses = await PointTransaction.find({ type: 'Bonus' })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedBonuses = recentBonuses.map(bonus => ({
      id: bonus._id,
      amount: bonus.amount,
      description: bonus.description,
      createdAt: bonus.createdAt,
      expiresAt: bonus.expiresAt,
      expired: bonus.expired,
      used: bonus.used,
      user: {
        id: bonus.userId._id,
        username: bonus.userId.username,
        email: bonus.userId.email
      }
    }));

    // Get bonus statistics
    const stats = await PointTransaction.aggregate([
      { $match: { type: 'Bonus' } },
      {
        $group: {
          _id: null,
          totalBonusPoints: { $sum: '$amount' },
          totalBonusTransactions: { $sum: 1 },
          activeBonusPoints: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$expired', false] },
                    { $eq: ['$used', false] },
                    { $gt: ['$expiresAt', new Date()] }
                  ]
                },
                '$amount',
                0
              ]
            }
          }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      recentBonuses: formattedBonuses,
      statistics: {
        totalBonusPoints: stats[0]?.totalBonusPoints || 0,
        totalBonusTransactions: stats[0]?.totalBonusTransactions || 0,
        activeBonusPoints: stats[0]?.activeBonusPoints || 0
      }
    });

  } catch (error) {
    console.error('Get admin bonus error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bonus data', details: error.message },
      { status: 500 }
    );
  }
}
