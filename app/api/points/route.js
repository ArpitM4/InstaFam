import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';
import PointTransaction from '@/models/PointTransaction';
import Payment from '@/models/Payment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    console.log('Points API: Starting request...');
    console.log('Points API: Environment:', process.env.NODE_ENV);
    console.log('Points API: Models available:', { User: !!User, PointTransaction: !!PointTransaction, Payment: !!Payment });
    
    // Step 1: Database connection
    console.log('Points API: Connecting to database...');
    await connectDB();
    console.log('Points API: Database connected successfully');
    
    // Step 2: Session validation
    console.log('Points API: Getting session...');
    console.log('Points API: authOptions available:', !!authOptions);
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

    // Step 4: Transaction lookup with proper filtering
    console.log('Points API: Fetching transactions...');
    const now = new Date();
    const transactions = await PointTransaction.find({ 
      userId: user._id,
      // Include all transactions except internal split transactions (used=true AND type != 'Spent')
      $or: [
        { used: { $ne: true } }, // Show non-used transactions
        { type: 'Spent' }, // Always show spent transactions even if marked as used
        { used: { $exists: false } } // Handle old records without used field
      ]
    })
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

    // Get expiring points info
    const expiringPoints = await PointTransaction.find({
      userId: user._id,
      type: 'Earned',
      expired: false,
      used: false,
      expiresAt: {
        $gt: now,
        $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      }
    }).sort({ expiresAt: 1 });

    const totalExpiring = expiringPoints.reduce((sum, tx) => sum + tx.amount, 0);

    // Step 5: Format transactions
    console.log('Points API: Formatting transactions...');
    const formattedTransactions = transactions.map(transaction => {
      // Handle backward compatibility for amount field
      const points = transaction.amount !== undefined ? transaction.amount : transaction.points_earned;
      
      return {
        _id: transaction._id,
        points_earned: transaction.points_earned,
        amount: points, // Use the calculated points value
        type: transaction.type,
        donation_amount: transaction.source_payment_id?.amount || 0,
        createdAt: transaction.createdAt,
        expiresAt: transaction.expiresAt,
        expired: transaction.expired,
        used: transaction.used,
        daysUntilExpiry: transaction.expiresAt ? Math.ceil((transaction.expiresAt - now) / (1000 * 60 * 60 * 24)) : null,
        description: transaction.description,
        payment_id: {
          message: transaction.source_payment_id?.message,
          to_user: {
            username: transaction.source_payment_id?.to_user?.username
          }
        }
      };
    });
    console.log('Points API: Transactions formatted successfully');

    console.log('Points API: Returning response...');
    return NextResponse.json({ 
      success: true, 
      totalPoints: user.points || 0,
      transactions: formattedTransactions,
      expiryInfo: {
        totalExpiring,
        expiringCount: expiringPoints.length,
        nextExpiry: expiringPoints.length > 0 ? expiringPoints[0].expiresAt : null
      }
    });

  } catch (error) {
    console.error('Points API Error Details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      environment: process.env.NODE_ENV
    });
    
    // Always return detailed error message for debugging
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack,
      name: error.name
    }, { status: 500 });
  }
}
