import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/app/api/auth/[...nextauth]/route";
import UnrankedDonation from "@/models/UnrankedDonation";
import User from "@/models/User";
import connectDB from "@/db/ConnectDb";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/unranked-donations
 * Fetches all unranked donations for the logged-in creator
 * Query params: None (uses session to identify creator)
 * Returns: Array of unranked donations sorted by date (newest first)
 */
export async function GET(req) {
  try {
    await connectDB();
    
    // Verify user is logged in
    const session = await getServerSession(nextAuthConfig);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ 
        error: "You must be logged in to view donations." 
      }, { status: 401 });
    }
    
    // Find the creator user
    const creator = await User.findOne({ email: session.user.email });
    if (!creator) {
      return NextResponse.json({ 
        error: "User not found." 
      }, { status: 404 });
    }
    
    // Fetch all unranked donations for this creator
    // Populate from_user to get user details if donor was logged in
    const donations = await UnrankedDonation.find({ to_user: creator._id })
      .populate('from_user', 'name email') // Get donor's name/email if they were logged in
      .sort({ createdAt: -1 }) // Newest first
      .lean();
    
    // Format the response
    const formattedDonations = donations.map(donation => ({
      _id: donation._id,
      donorName: donation.from_name,
      donorEmail: donation.from_user?.email || null, // Only if donor was logged in
      amount: donation.amount,
      message: donation.message,
      date: donation.createdAt,
      paymentId: donation.oid
    }));
    
    return NextResponse.json({ 
      success: true,
      donations: formattedDonations,
      total: formattedDonations.length,
      totalAmount: formattedDonations.reduce((sum, d) => sum + d.amount, 0)
    });
    
  } catch (error) {
    console.error('Error fetching unranked donations:', error);
    return NextResponse.json({ 
      error: "Failed to fetch donations", 
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
