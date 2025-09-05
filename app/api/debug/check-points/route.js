/**
 * Quick API endpoint to check user points
 */

import User from '@/models/User';
import ConnectDb from '@/db/ConnectDb';

export async function GET() {
  try {
    await ConnectDb();
    
    const user = await User.findOne(
      { username: '_instafam_official' },
      { username: 1, points: 1 }
    );
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    return Response.json({
      username: user.username,
      points: user.points,
      message: user.points === 110 ? 
        '🎉 SUCCESS! Points correctly incremented (10 + 100 refund)' :
        user.points === 10 ?
        '❌ ISSUE: Still showing original points (refund not incremented)' :
        user.points === 100 ?
        '❌ ISSUE: Points replaced with refund amount (not incremented)' :
        `🤔 UNEXPECTED: Points value ${user.points} doesn't match expected scenarios`
    });
    
  } catch (error) {
    console.error('Error checking user points:', error);
    return Response.json(
      { error: 'Failed to check user points' },
      { status: 500 }
    );
  }
}
