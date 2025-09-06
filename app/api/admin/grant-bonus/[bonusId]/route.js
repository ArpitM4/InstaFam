import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ConnectDb from '@/db/ConnectDb';
import Bonus from '@/models/Bonus';

async function isAdminUser(email) {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !(await isAdminUser(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bonusId } = params;
    const { bonusAmount } = await request.json();

    if (!bonusAmount || bonusAmount <= 0) {
      return NextResponse.json({ error: 'Invalid bonus amount' }, { status: 400 });
    }

    await ConnectDb();

    const bonus = await Bonus.findById(bonusId);
    if (!bonus) {
      return NextResponse.json({ error: 'Bonus not found' }, { status: 404 });
    }

    if (bonus.status !== 'Requested') {
      return NextResponse.json({ error: 'Bonus is not in requested status' }, { status: 400 });
    }

    // Grant the bonus
    bonus.status = 'Granted';
    bonus.grantedAt = new Date();
    bonus.bonusAmount = bonusAmount;
    
    await bonus.save();

    return NextResponse.json({ message: 'Bonus granted successfully' });
  } catch (error) {
    console.error('Grant bonus error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
