import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/ConnectDb';

// Create a simple analytics event model
const analyticsEvents = []; // In production, this would be a database

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const { event, properties } = await req.json();

    const analyticsEvent = {
      id: Date.now(),
      event,
      properties: {
        ...properties,
        userEmail: session?.user?.email || 'anonymous',
        timestamp: new Date().toISOString()
      }
    };

    // Store the event (in production, save to database)
    analyticsEvents.push(analyticsEvent);
    
    // Keep only last 1000 events in memory
    if (analyticsEvents.length > 1000) {
      analyticsEvents.shift();
    }

    console.log('📊 Analytics Event Tracked:', analyticsEvent);

    return NextResponse.json({ success: true, eventId: analyticsEvent.id });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get('event');
    const days = parseInt(searchParams.get('days')) || 7;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let filteredEvents = analyticsEvents.filter(event => 
      new Date(event.properties.timestamp) >= cutoffDate
    );

    if (eventType) {
      filteredEvents = filteredEvents.filter(event => event.event === eventType);
    }

    return NextResponse.json({ 
      success: true, 
      events: filteredEvents,
      totalCount: filteredEvents.length 
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
