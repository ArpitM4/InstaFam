"use server";
import Razorpay from "razorpay";
import Payment from "@/models/Payment";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";

export const initiate = async (amount, to_username, paymentform) => {
  try {
    // Connect to the database
    await connectDb();

    // Create a Razorpay instance
    const instance = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });

    // Prepare Razorpay order options
    const options = {
      amount: Number.parseInt(amount) * 100, // Convert amount to paise (Razorpay expects amount in smallest currency unit)
      currency: "INR",
    };

    // Create an order using Razorpay
    const order = await instance.orders.create(options);

    // Save payment information in the database as a pending payment
    await Payment.create({
      oid: order.id,
      amount: amount,
      to_user: to_username,
      name: paymentform.name,
      message: paymentform.message,
    });

    // Return the created order object
    return order;
  } catch (error) {
    console.error("Error in initiating payment:", error);
    // throw new Error("Failed to initiate payment.");
  }
};
