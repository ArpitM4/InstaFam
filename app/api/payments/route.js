import { NextResponse } from "next/server";
import Payment from "@/models/Payment";
import connectDB from "@/db/ConnectDb";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const eventStart = searchParams.get("eventStart");

  if (!userId) {
    return NextResponse.json([], { status: 400 });
  }

  const query = { to_user: userId };
  if (eventStart) {
    query.createdAt = { $gte: new Date(eventStart) };
  }

  const payments = await Payment.find(query).sort({ amount: -1 }).populate('from_user', 'name username').lean();
  const safePayments = payments.map(payment => {
    // Ensure all nested ObjectIds are properly serialized
    const serializedPayment = {
      _id: payment._id.toString(),
      to_user: payment.to_user.toString(),
      oid: payment.oid,
      message: payment.message,
      amount: payment.amount,
      done: payment.done,
      createdAt: payment.createdAt?.toISOString(),
      updatedAt: payment.updatedAt?.toISOString(),
    };

    // Handle populated from_user - only add serialized user ID and username
    if (payment.from_user) {
      serializedPayment.from_user = payment.from_user._id ? payment.from_user._id.toString() : null;
      serializedPayment.name = payment.from_user.username || payment.from_user.name || 'Anonymous';
    } else {
      serializedPayment.from_user = null;
      serializedPayment.name = 'Anonymous';
    }

    return serializedPayment;
  });

  return NextResponse.json(safePayments);
}
