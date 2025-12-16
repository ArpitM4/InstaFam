import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ConnectDb from '@/db/ConnectDb';
import User from '@/models/User';

async function isAdminUser(email) {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !(await isAdminUser(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;
    const updateData = await request.json();

    await ConnectDb();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update fields
    if (updateData.name !== undefined) user.name = updateData.name;
    if (updateData.username !== undefined) user.username = updateData.username;
    if (updateData.email !== undefined) user.email = updateData.email;
    if (updateData.accountType !== undefined) user.accountType = updateData.accountType;
    if (updateData.points !== undefined) user.points = updateData.points;
    if (updateData.vaultEarningsBalance !== undefined) user.vaultEarningsBalance = updateData.vaultEarningsBalance;

    // Update Instagram verification
    if (updateData.instagramVerified !== undefined) {
      if (!user.instagram) user.instagram = {};
      user.instagram.isVerified = updateData.instagramVerified;
    }

    // Update payment info
    if (updateData.paymentPhone !== undefined || updateData.paymentUpi !== undefined) {
      if (!user.paymentInfo) user.paymentInfo = {};
      if (updateData.paymentPhone !== undefined) user.paymentInfo.phone = updateData.paymentPhone;
      if (updateData.paymentUpi !== undefined) user.paymentInfo.upi = updateData.paymentUpi;
    }

    user.updatedAt = new Date();
    await user.save();

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
