// actions/eventActions.js
'use server'

import User from "@/models/User";
import connectDb from "@/db/ConnectDb";

export const startEvent = async (username) => {
  await connectDb();
  const user = await User.findOne({ username });
  if (user) {
    user.eventInProgress = true;
    await user.save();
  }
};

export const endEvent = async (username) => {
  await connectDb();
  const user = await User.findOne({ username });
  if (user) {
    user.eventInProgress = false;
    await user.save();
  }
};