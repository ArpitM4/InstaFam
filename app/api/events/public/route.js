import { NextResponse } from "next/server";
import connectDB from "@/db/ConnectDb";
import Event from "@/models/Event";
import User from "@/models/User";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public endpoint to fetch active event for any user by username
 * GET /api/events/public?username=<username>
 */
export async function GET(request) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');
        
        if (!username) {
            return NextResponse.json({ error: "Username required" }, { status: 400 });
        }

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Auto-complete expired active events first
        await Event.updateMany(
            { 
                creatorId: user._id, 
                status: 'active',
                endTime: { $lt: new Date() }
            },
            { 
                status: 'completed'
            }
        );

        // Clear user's event fields if events were expired
        if (user.eventEnd && new Date(user.eventEnd) < new Date()) {
            await User.updateOne(
                { _id: user._id },
                { 
                    $unset: { 
                        eventStart: 1, 
                        eventEnd: 1 
                    } 
                }
            );
        }

        // Get current active event
        const currentEvent = await Event.findOne({ 
            creatorId: user._id, 
            status: 'active' 
        }).sort({ startTime: -1 });
        
        return NextResponse.json({ event: currentEvent });

    } catch (error) {
        console.error("Public Event Fetch Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
