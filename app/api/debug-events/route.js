import { NextResponse } from 'next/server';
import connectDB from '@/db/ConnectDb';
import Event from '@/models/Event';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    // Get all events with their creators
    const events = await Event.find({}).populate('creatorId', 'email username');
    
    console.log('=== ALL EVENTS DEBUG ===');
    console.log('Total events:', events.length);
    
    const eventDetails = events.map(event => ({
      id: event._id.toString(),
      title: event.title,
      status: event.status,
      creatorEmail: event.creatorId?.email || 'Unknown',
      creatorUsername: event.creatorId?.username || 'Unknown',
      startTime: event.startTime,
      endTime: event.endTime,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));
    
    eventDetails.forEach((event, index) => {
      console.log(`Event ${index + 1}:`, event);
    });
    
    // Find active events specifically
    const activeEvents = events.filter(event => event.status === 'active');
    console.log('Active events:', activeEvents.length);
    
    return NextResponse.json({
      success: true,
      totalEvents: events.length,
      activeEvents: activeEvents.length,
      events: eventDetails,
      activeEventDetails: activeEvents.map(event => ({
        id: event._id.toString(),
        status: event.status,
        creatorEmail: event.creatorId?.email,
        startTime: event.startTime,
        endTime: event.endTime
      }))
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}
