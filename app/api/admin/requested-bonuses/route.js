import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ConnectDb from '@/db/ConnectDb';
import Bonus from '@/models/Bonus';

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

    const bonuses = await Bonus.find({ status: 'Requested' })
      .sort({ requestedAt: 1 }); // Oldest first

    return NextResponse.json({ bonuses });
  } catch (error) {
    console.error('Fetch requested bonuses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
