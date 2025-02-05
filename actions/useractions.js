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

export const fetchuser = async (username) => {
  await connectDb();
  let u = await User.findOne({ username: username });
  let user = u.toObject({ flattenObjectIds: true });
  return user;
};

export const fetchpayments = async (username) => {
  await connectDb();
  // find all payments sorted by decreasing order of amount and flatten objects
  let p = await Payment.find({ to_user: username }).sort({ amount: -1 }).lean();
  return p;
};


export const updateProfile = async (data, oldusername) => {
  await connectDb();
  let ndata = Object.fromEntries(data);

  // If the username is being updated, check if username is available
  if (oldusername !== ndata.username) {
    let u = await User.findOne({ username: ndata.username });
    if (u) {
      return { error: "Username already exists" };
    }
  }

  await User.updateOne({ email: ndata.email }, ndata);
};
