import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/app/api/auth/[...nextauth]/route";
import Payment from "@/models/Payment";
import UnrankedDonation from "@/models/UnrankedDonation"; // New model for non-event donations
import User from "@/models/User";
import PointTransaction from "@/models/PointTransaction";
import connectDB from "@/db/ConnectDb";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getAccessToken = async () => {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${process.env.PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  return data.access_token;
};

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    console.log('PayPal API received body:', body); // Debug log

    const { amount, message, orderID, captureOnly, to_user, eventId, isRanked, donorName } = body;

    // Session is OPTIONAL now - only required for ranked donations
    const session = await getServerSession(nextAuthConfig);

    /**
     * RANKED vs UNRANKED DONATION LOGIC:
     * - RANKED: Event is active, user must be logged in, saved to Payment model, leaderboard eligible
     * - UNRANKED: No event active, can be guest or logged in, saved to UnrankedDonation model, no leaderboard
     */

    let fanUser = null;

    // For RANKED donations, authentication is required
    if (isRanked) {
      if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "You must be logged in for ranked contributions." }, { status: 401 });
      }
      fanUser = await User.findOne({ email: session.user.email });
      if (!fanUser) {
        return NextResponse.json({ error: "Fan user not found." }, { status: 401 });
      }
    } else {
      // For UNRANKED donations, try to get user if logged in (optional)
      if (session && session.user && session.user.email) {
        fanUser = await User.findOne({ email: session.user.email });
      }
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: "Failed to get access token" }, { status: 500 });
    }

    // Find userId (ObjectId) for to_user
    let toUserId = to_user;
    if (!toUserId) {
      return NextResponse.json({ error: "Creator userId (to_user) required." }, { status: 400 });
    }

    // If captureOnly is true, just save the payment (capture already done client-side)
    if (captureOnly && orderID && body.captureDetails) {
      const captureData = body.captureDetails;
      if (captureData.status === "COMPLETED") {
        try {
          /**
           * SAVE DONATION BASED ON TYPE:
           * - If RANKED (event active): Save to Payment model with eventId
           * - If UNRANKED (no event): Save to UnrankedDonation model with donor name
           */

          if (isRanked) {
            // RANKED DONATION - Save to Payment model (requires logged in user)
            const paymentData = {
              oid: orderID,
              amount: amount,
              to_user: toUserId,
              from_user: fanUser._id,
              message: message,
              done: true,
            };

            // Include eventId for ranked donations
            if (eventId) {
              paymentData.eventId = eventId;
            }

            console.log('Creating RANKED payment with data:', paymentData);

            const payment = await Payment.create(paymentData);

            // Award Fam Points to the fan using the existing points system
            // Calculate points earned (₹10 = 1 point, so amount * 0.1)
            const pointsToAdd = Math.floor(amount * 0.1);

            // Update user's total points
            await User.findByIdAndUpdate(fanUser._id, {
              $inc: { points: pointsToAdd }
            });

            // Create point transaction record
            await PointTransaction.create({
              userId: fanUser._id,
              creatorId: toUserId, // Creator the points belong to
              points_earned: pointsToAdd,
              source_payment_id: payment._id,
              description: `Ranked support payment of $${amount}`
            });

            return NextResponse.json({
              success: true,
              capture: captureData,
              paymentId: payment._id,
              pointsAwarded: pointsToAdd,
              type: 'ranked'
            });

          } else {
            // UNRANKED DONATION - Save to UnrankedDonation model (guest or logged in)
            const unrankedData = {
              oid: orderID,
              amount: amount,
              to_user: toUserId,
              from_name: donorName || 'Anonymous', // Use provided name or default
              message: message,
              done: true,
            };

            // Optionally link to user account if logged in
            if (fanUser) {
              unrankedData.from_user = fanUser._id;
            }

            console.log('Creating UNRANKED donation with data:', unrankedData);

            const donation = await UnrankedDonation.create(unrankedData);

            // Award Fam Points ONLY if user is logged in
            let pointsAwarded = 0;
            if (fanUser) {
              const pointsToAdd = Math.floor(amount * 0.1);

              await User.findByIdAndUpdate(fanUser._id, {
                $inc: { points: pointsToAdd }
              });

              await PointTransaction.create({
                userId: fanUser._id,
                creatorId: toUserId, // Creator the points belong to
                points_earned: pointsToAdd,
                source_payment_id: donation._id,
                description: `Unranked support payment of $${amount}`
              });

              pointsAwarded = pointsToAdd;
            }

            return NextResponse.json({
              success: true,
              capture: captureData,
              paymentId: donation._id,
              pointsAwarded: pointsAwarded,
              type: 'unranked'
            });
          }

        } catch (error) {
          console.error('Error creating payment/donation:', error);
          return NextResponse.json({
            error: "Failed to save payment",
            details: error.message
          }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: "PayPal capture not completed", details: captureData }, { status: 400 });
      }
    }

    // Otherwise, create a new order (for initial payment intent)
    console.log('Creating PayPal order with amount:', amount); // Debug log

    const response = await fetch(`${process.env.PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount,
            },
            payee: {
              email_address: process.env.PAYPAL_RECEIVER_EMAIL || process.env.PAYPAL_CLIENT_ID // fallback to client id if email not set
            }
          },
        ],
      }),
    });

    const order = await response.json();
    console.log('PayPal order creation response:', order); // Debug log

    if (order.id) {
      console.log('Successfully created PayPal order with ID:', order.id);
    } else {
      console.error('PayPal order creation failed:', order);
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('PayPal API Error:', error);
    return NextResponse.json({
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : 'Payment processing failed'
    }, { status: 500 });
  }
}