import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDb from '@/db/ConnectDb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDb();

    // Find the current user and populate their following list
    const user = await User.findOne({ email: session.user.email })
      .populate({
        path: 'following',
        select: 'username name profilepic accountType description isVerified',
        match: {
          accountType: { $in: ['Creator', 'VCreator'] },
          visibility: 'public'
        }
      })
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Filter out any null entries (in case some followed users were deleted)
    const creators = (user.following || [])
      .filter(creator => creator !== null)
      .map(creator => ({
        _id: creator._id?.toString(),
        username: creator.username,
        name: creator.name,
        profilepic: creator.profilepic,
        accountType: creator.accountType,
        description: creator.description,
        isVerified: creator.isVerified
      }));

    return NextResponse.json({
      creators,
      total: creators.length
    });

  } catch (error) {
    console.error('Error fetching followed creators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch followed creators' },
      { status: 500 }
    );
  }
}
