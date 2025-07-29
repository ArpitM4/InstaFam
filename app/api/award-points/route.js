import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/db/ConnectDb';
import User from '@/models/User';
import Payment from '@/models/Payment';
import PointTransaction from '@/models/PointTransaction';

export async function POST(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { paymentId } = await req.json();
    
    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Find the payment
    const payment = await Payment.findById(paymentId).populate('from_user');
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Get the user who made the payment from the populated from_user field
    const user = payment.from_user;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if points have already been awarded for this payment
    const existingTransaction = await PointTransaction.findOne({ source_payment_id: paymentId });
    if (existingTransaction) {
      return NextResponse.json({ error: 'Points already awarded for this payment' }, { status: 400 });
    }

    // Calculate points earned (₹10 = 1 point, so amount * 0.1)
    const pointsEarned = Math.floor(payment.amount * 0.1);

    // Update user's total points
    await User.findByIdAndUpdate(user._id, {
      $inc: { points: pointsEarned }
    });

    // Create point transaction record
    const pointTransaction = new PointTransaction({
      userId: user._id,
      points_earned: pointsEarned,
      source_payment_id: paymentId,
      description: `Support for ${payment.to_user}`,
    });
    await pointTransaction.save();

    return NextResponse.json({ 
      success: true, 
      pointsEarned,
      totalPoints: user.points + pointsEarned
    });

  } catch (error) {
    console.error('Error awarding points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
