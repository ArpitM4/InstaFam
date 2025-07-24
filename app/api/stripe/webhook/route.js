import { NextResponse } from "next/server";
import Stripe from "stripe";
import Payment from "@/models/Payment";
import connectDb from "@/db/ConnectDb";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const POST = async (req) => {
    await connectDb();
    const sig = req.headers.get("stripe-signature");
    let event;

    try {
        const rawBody = await req.text();
        event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object;
            // Fulfill the purchase...
            const payment = await Payment.findOneAndUpdate(
                { oid: session.id },
                { done: true },
                { new: true }
            );
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
};