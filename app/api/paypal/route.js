import { NextResponse } from "next/server";
import Payment from "@/models/Payment";
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
  const body = await req.json();
  const { amount, username, paymentform, orderID, captureOnly } = body;

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Failed to get access token" }, { status: 500 });
  }

  // If captureOnly is true, just save the payment (capture already done client-side)
  if (captureOnly && orderID && body.captureDetails) {
    const captureData = body.captureDetails;
    if (captureData.status === "COMPLETED") {
      await Payment.create({
        oid: orderID,
        amount: amount,
        to_user: username,
        name: paymentform.name,
        message: paymentform.message,
        done: true,
      });
      return NextResponse.json({ success: true, capture: captureData });
    } else {
      return NextResponse.json({ error: "PayPal capture not completed", details: captureData }, { status: 400 });
    }
  }

  // Otherwise, create a new order (for initial payment intent)
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
  return NextResponse.json(order);
}