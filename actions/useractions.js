"use server";

import Payment from "@/models/Payment";
import connectDb from "@/db/ConnectDb";
import User from "@/models/User";



// Accepts either username or email, prefers email if it looks like one
export const fetchuser = async (identifier) => {
  if (!identifier) return null;
  await connectDb();
  let query = {};
  if (identifier.includes('@')) {
    query.email = identifier;
  } else {
    query.username = identifier;
  }
  let u = await User.findOne(query);
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

  let p = await Payment.find(query)
    .populate('from_user', 'name username')
    .sort({ amount: -1 })
    .lean();

  const safePayments = p.map(payment => {
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
  if (!ndata.username || ndata.username.trim() === "") {
    delete ndata.username;
  }
  console.log("Received data:", ndata);
  await User.updateOne({ email: ndata.email }, ndata);
  // Return the updated user so the modal logic can use it immediately
  const user = await User.findOne({ email: ndata.email });
  return { success: true, user };
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
