import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/db/ConnectDb";
import Event from "@/models/Event";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "../auth/[...nextauth]/route";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await connectDB();
        const session = await getServerSession(nextAuthConfig);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the creator's user ID
        const creator = await User.findOne({ email: session.user.email });
        if (!creator) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // ALWAYS auto-complete expired active events first
        const expiredEventsUpdate = await Event.updateMany(
            { 
                creatorId: creator._id, 
                status: 'active',
                endTime: { $lt: new Date() } // endTime is in the past
            },
            { 
                status: 'completed'
            }
        );

        // If any events were expired, also clear user's event fields
        if (expiredEventsUpdate.modifiedCount > 0) {
            await User.updateOne(
                { _id: creator._id },
                { 
                    $unset: { 
                        eventStart: 1, 
                        eventEnd: 1 
                    } 
                }
            );
        }

        // Get URL search params
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'current') {
            // Get current active event (should be none if expired)
            const currentEvent = await Event.findOne({ 
                creatorId: creator._id, 
                status: 'active' 
            }).sort({ startTime: -1 });
            
            return NextResponse.json({ event: currentEvent });
        }

        if (action === 'history') {
            // Get all completed events with their payment details
            const events = await Event.aggregate([
                { $match: { creatorId: creator._id, status: 'completed' } },
                { $sort: { endTime: -1 } },
                {
                    $lookup: {
                        from: 'payments',
                        localField: '_id',
                        foreignField: 'eventId',
                        as: 'payments',
                        pipeline: [
                            { $match: { done: true } },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'from_user',
                                    foreignField: '_id',
                                    as: 'fanDetails'
                                }
                            },
                            {
                                $project: {
                                    amount: 1,
                                    message: 1,
                                    createdAt: 1,
                                    fanUsername: { $arrayElemAt: ['$fanDetails.username', 0] },
                                    fanName: { $arrayElemAt: ['$fanDetails.name', 0] }
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        totalEarnings: { $sum: '$payments.amount' },
                        paymentCount: { $size: '$payments' }
                    }
                }
            ]);

            return NextResponse.json({ events });
        }

        // Default: return all events
        const allEvents = await Event.find({ creatorId: creator._id })
            .sort({ startTime: -1 });

        return NextResponse.json({ events: allEvents });

    } catch (error) {
        console.error("Events API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const session = await getServerSession(nextAuthConfig);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const creator = await User.findOne({ email: session.user.email });
        if (!creator) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { title, perkDescription, duration = 24 } = await request.json();

        if (!title || !perkDescription) {
            return NextResponse.json({ 
                error: "Title and perk description are required" 
            }, { status: 400 });
        }

        // End any currently active events
        await Event.updateMany(
            { creatorId: creator._id, status: 'active' },
            { status: 'completed', endTime: new Date() }
        );

        // Create new event
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + (duration * 60 * 60 * 1000)); // duration in hours

        const newEvent = new Event({
            creatorId: creator._id,
            title,
            perkDescription,
            startTime,
            endTime,
            status: 'active'
        });

        await newEvent.save();

        return NextResponse.json({ 
            event: newEvent,
            message: "Event created successfully" 
        });

    } catch (error) {
        console.error("Create Event Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await connectDB();
        const session = await getServerSession(nextAuthConfig);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const creator = await User.findOne({ email: session.user.email });
        if (!creator) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { eventId, action } = await request.json();

        if (action === 'end') {
            // End the specified event
            const event = await Event.findOneAndUpdate(
                { _id: eventId, creatorId: creator._id, status: 'active' },
                { status: 'completed', endTime: new Date() },
                { new: true }
            );

            if (!event) {
                return NextResponse.json({ 
                    error: "Event not found or already ended" 
                }, { status: 404 });
            }

            // Calculate total earnings
            const totalEarnings = await Payment.aggregate([
                { $match: { eventId: event._id, done: true } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const earnings = totalEarnings.length > 0 ? totalEarnings[0].total : 0;
            
            // Update event with total earnings
            await Event.findByIdAndUpdate(eventId, { totalEarnings: earnings });

            return NextResponse.json({ 
                event: { ...event.toObject(), totalEarnings: earnings },
                message: "Event ended successfully" 
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Update Event Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
