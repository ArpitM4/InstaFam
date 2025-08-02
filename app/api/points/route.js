import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { nextAuthConfig } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/db/ConnectDb';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';

export async function GET(req) {
  await dbConnect();
  const session = await getServerSession(nextAuthConfig);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find the user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get point transactions for this user
    const transactions = await PointTransaction.find({ userId: user._id })
      .populate({
        path: 'source_payment_id',
        populate: {
          path: 'to_user',
          select: 'username'
        }
      })
      .sort({ createdAt: -1 })
      .limit(50);

    // Transform transactions for frontend consumption
    const formattedTransactions = transactions.map(transaction => ({
      _id: transaction._id,
      points_earned: transaction.points_earned,
      donation_amount: transaction.source_payment_id?.amount || 0,
      createdAt: transaction.createdAt,
      payment_id: {
        message: transaction.source_payment_id?.message,
        to_user: {
          username: transaction.source_payment_id?.to_user?.username
        }
      }
    }));

    return NextResponse.json({ 
      success: true, 
      totalPoints: user.points || 0,
      transactions: formattedTransactions
    });

  } catch (error) {
    console.error('Error fetching points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
