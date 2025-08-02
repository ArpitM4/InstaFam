import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/ConnectDb';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';

export async function GET(req) {
  try {
    console.log('Points API: Starting request...');
    
    // Step 1: Database connection
    console.log('Points API: Connecting to database...');
    await connectDb();
    console.log('Points API: Database connected successfully');
    
    // Step 2: Session validation
    console.log('Points API: Getting session...');
    const session = await getServerSession(authOptions);
    console.log('Points API: Session retrieved:', !!session);
    
    if (!session) {
      console.log('Points API: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('Points API: Session valid for email:', session.user?.email);

    // Step 3: User lookup
    console.log('Points API: Finding user...');
    const user = await User.findOne({ email: session.user.email });
    console.log('Points API: User found:', !!user);
    
    if (!user) {
      console.log('Points API: User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log('Points API: User ID:', user._id, 'Points:', user.points);

    // Step 4: Transaction lookup
    console.log('Points API: Fetching transactions...');
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
    console.log('Points API: Transactions found:', transactions.length);

    // Step 5: Format transactions
    console.log('Points API: Formatting transactions...');
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
    console.log('Points API: Transactions formatted successfully');

    console.log('Points API: Returning response...');
    return NextResponse.json({ 
      success: true, 
      totalPoints: user.points || 0,
      transactions: formattedTransactions
    });

  } catch (error) {
    console.error('Points API Error Details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    }, { status: 500 });
  }
}
