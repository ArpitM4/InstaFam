import { NextResponse } from "next/server";
import Stripe from "stripe";
import Payment from "@/models/Payment";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const POST = async (req) => {
    await connectDb();
    const data = await req.json();
    const { amount, username, paymentform } = data;

    const user = await User.findOne({ username });

    try {
        const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Donation",
                        images: [user.profilepic],
                    },
                    unit_amount: amount * 100,
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_URL}/${username}?paymentdone=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/${username}`,
        metadata: {
            name: paymentform.name,
            message: paymentform.message,
            to_user: username,
            amount: amount,
        },
    });

    const payment = new Payment({
        name: paymentform.name,
        to_user: username,
        oid: session.id,
        message: paymentform.message,
        amount: amount,
        done: false,
    });
    await payment.save();

    return NextResponse.json({ id: session.id });
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};