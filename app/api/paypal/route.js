import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Payment from "@/models/Payment";
import User from "@/models/User";
import PointTransaction from "@/models/PointTransaction";
import connectDB from "@/db/ConnectDb";

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
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "You must be logged in to pay." }, { status: 401 });
  }
  const fanUser = await User.findOne({ email: session.user.email });
  if (!fanUser) {
    return NextResponse.json({ error: "Fan user not found." }, { status: 401 });
  }
  
  const body = await req.json();
  console.log('PayPal API received body:', body); // Debug log
  
  const { amount, message, orderID, captureOnly, to_user } = body;

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
      const payment = await Payment.create({
        oid: orderID,
        amount: amount,
        to_user: toUserId,
        from_user: fanUser._id,
        message: message,
        done: true,
      });

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
        points_earned: pointsToAdd,
        source_payment_id: payment._id,
        description: `Support payment of $${amount}`
      });

      return NextResponse.json({ 
        success: true, 
        capture: captureData, 
        paymentId: payment._id,
        pointsAwarded: pointsToAdd
      });
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
}