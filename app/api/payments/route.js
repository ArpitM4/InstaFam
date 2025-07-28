import { NextResponse } from "next/server";
import Payment from "@/models/Payment";
import connectDB from "@/db/ConnectDb";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const eventStart = searchParams.get("eventStart");

  if (!username) {
    return NextResponse.json([], { status: 400 });
  }

  const query = { to_user: username };
  if (eventStart) {
    query.createdAt = { $gte: new Date(eventStart) };
  }

  const payments = await Payment.find(query).sort({ amount: -1 }).lean();
  const safePayments = payments.map(payment => ({
    ...payment,
    _id: payment._id.toString(),
    createdAt: payment.createdAt?.toISOString(),
    updatedAt: payment.updatedAt?.toISOString(),
  }));

  return NextResponse.json(safePayments);
}
