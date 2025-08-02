import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { nextAuthConfig } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/ConnectDb";
import Event from "@/models/Event";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(nextAuthConfig);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the creator's user ID
    const creator = await User.findOne({ email: session.user.email });
    if (!creator) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find current active event
    const activeEvent = await Event.findOne({ 
      creatorId: creator._id, 
      status: 'active' 
    });

    if (activeEvent) {
      return NextResponse.json({
        message: "Active event found",
        event: {
          _id: activeEvent._id.toString(),
          title: activeEvent.title,
          perkDescription: activeEvent.perkDescription,
          startTime: activeEvent.startTime.toISOString(),
          endTime: activeEvent.endTime.toISOString(),
          status: activeEvent.status,
          creatorId: activeEvent.creatorId.toString(),
          createdAt: activeEvent.createdAt.toISOString(),
          updatedAt: activeEvent.updatedAt.toISOString(),
          endedAt: activeEvent.endedAt?.toISOString()
        }
      });
    } else {
      return NextResponse.json({
        message: "No active event found",
        event: null
      });
    }
  } catch (error) {
    console.error('Error in debug-current-event:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
