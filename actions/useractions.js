"use server";

import Payment from "@/models/Payment";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";



export const fetchuser = async (username) => {
  if (!username) return null;  // Avoid searching with undefined

  await connectDb();
  let u = await User.findOne({ username: username });
  
  if (!u) return null;

  let user = u.toObject({ flattenObjectIds: true });
  return user;
};

export const fetchpayments = async (username, eventStart = null) => {
  await connectDb();

  const query = { to_user: username };

  // If eventStart is passed, filter by it
  if (eventStart) {
    query.createdAt = { $gte: new Date(eventStart) };
  }

  let p = await Payment.find(query).sort({ amount: -1 }).lean();

  const safePayments = p.map(payment => ({
    ...payment,
    _id: payment._id.toString(),
    createdAt: payment.createdAt?.toISOString(),
    updatedAt: payment.updatedAt?.toISOString(),
  }));

  return safePayments;
};



export const updateProfile = async (data, oldusername) => {
  await connectDb();
  let ndata = typeof data.entries === "function" ? Object.fromEntries(data) : data;

  // Only check for conflict if username is being changed
  if (oldusername !== ndata.username) {
    let existingUser = await User.findOne({ username: ndata.username });

    // ❌ If the username is already taken AND that user is verified → block it
    if (existingUser && existingUser.instagram?.isVerified) {
      return { error: "This verified username is already taken" };
    }
  }
  console.log("Received data:", ndata);

  await User.updateOne({ email: ndata.email }, ndata);
  
  return { success: true }; // ✅ Add this line

};





// actions/useractions.js
export const updatePaymentInfo = async ({ phone, upi }, username) => {
  console.log("updatePaymentInfo called with:", phone, upi, username); // ← Add this
  await connectDb();
console.log("✅ Connected to DB");

  const paymentInfo = {
    ...(phone && { phone }),
    ...(upi && { upi }),
  };

const res = await User.updateOne({ username }, { $set: { paymentInfo } });
console.log("Mongo Update Result:", res);

};


export const generateInstagramOTP = async (username) => {
  await connectDb();

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpGeneratedAt = new Date();

  await User.updateOne(
    { username },
    {
      $set: {
        "instagram.otp": otp,
        "instagram.otpGeneratedAt": otpGeneratedAt,
        "instagram.isVerified": false
      }
    }
  );

  return otp;
};
