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
  console.log('🔍 fetchuser Debug - Query:', query);
  let u = await User.findOne(query);
  console.log('🔍 fetchuser Debug - User found:', !!u);
  if (u) {
    console.log('🔍 fetchuser Debug - User accountType:', u.accountType);
  }
  if (!u) return null;
  let user = u.toObject({ flattenObjectIds: true });
  console.log('🔍 fetchuser Debug - Final user object accountType:', user.accountType);
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
  await User.updateOne({ email: ndata.email }, ndata);
  // Return the updated user so the modal logic can use it immediately
  const user = await User.findOne({ email: ndata.email });
  return { success: true, user };
};





// actions/useractions.js
export const updatePaymentInfo = async ({ phone, upi }, username) => {
  await connectDb();

  const paymentInfo = {
    ...(phone && { phone }),
    ...(upi && { upi }),
  };

  const res = await User.updateOne({ username }, { $set: { paymentInfo } });

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

// Event-related functions
export const fetchEvents = async (userId, type = 'history') => {
  try {
    const { getServerSession } = await import('next-auth/next');
    const { nextAuthConfig } = await import('@/app/api/auth/[...nextauth]/route');
    const connectDB = (await import('@/db/ConnectDb')).default;
    const Event = (await import('@/models/Event')).default;
    const Payment = (await import('@/models/Payment')).default;
    const User = (await import('@/models/User')).default;

    await connectDB();
    const session = await getServerSession(nextAuthConfig);
    
    if (!session?.user?.email) {
      throw new Error('Unauthorized');
    }

    // Get the creator's user ID
    const creator = await User.findOne({ email: session.user.email });
    if (!creator) {
      throw new Error('User not found');
    }

    if (type === 'current') {
      // Find the current active event for this user
      const event = await Event.findOne({ 
        creatorId: creator._id, 
        status: 'active' 
      });
      
      if (event) {
        // Convert to plain object to avoid serialization issues
        const plainEvent = event.toObject();
        return {
          _id: plainEvent._id.toString(),
          title: plainEvent.title,
          perkDescription: plainEvent.perkDescription,
          startTime: plainEvent.startTime.toISOString(),
          endTime: plainEvent.endTime.toISOString(),
          status: plainEvent.status,
          creatorId: plainEvent.creatorId.toString(),
          createdAt: plainEvent.createdAt.toISOString(),
          updatedAt: plainEvent.updatedAt.toISOString(),
          endedAt: plainEvent.endedAt?.toISOString()
        };
      }
      return null;
    } else {
      // Get all events this creator has ever started
      console.log('DEBUG: Looking for events for creator:', creator._id, creator.email);
      const events = await Event.find({ 
        creatorId: creator._id 
      }).sort({ createdAt: -1 });

      console.log('DEBUG: Found events:', events.length);
      if (events.length > 0) {
        console.log('DEBUG: First event:', events[0]);
      }

      // For each event, find all payments received during that event's time period
      const eventsWithPayments = await Promise.all(
        events.map(async (event) => {
          console.log('DEBUG: Processing event:', event._id, 'from', event.startTime, 'to', event.endTime);
          
          // Find payments made to this creator during the event's time period
          const payments = await Payment.find({
            to_user: creator._id,
            createdAt: {
              $gte: event.startTime,
              $lte: event.endTime
            }
          }).populate('from_user', 'name username email');

          console.log('DEBUG: Found payments for event:', payments.length);

          // Calculate total earnings for this event
          const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0);

          // Convert to plain object and add computed fields
          const plainEvent = event.toObject();
          return {
            ...plainEvent,
            _id: plainEvent._id.toString(),
            creatorId: plainEvent.creatorId.toString(),
            startTime: plainEvent.startTime.toISOString(),
            endTime: plainEvent.endTime.toISOString(),
            createdAt: plainEvent.createdAt.toISOString(),
            updatedAt: plainEvent.updatedAt.toISOString(),
            payments: payments.map(payment => ({
              _id: payment._id.toString(),
              amount: payment.amount,
              message: payment.message,
              createdAt: payment.createdAt.toISOString(),
              from_user: payment.from_user ? {
                name: payment.from_user.name,
                username: payment.from_user.username,
                email: payment.from_user.email
              } : null
            })),
            totalEarnings,
            paymentCount: payments.length
          };
        })
      );

      console.log('DEBUG: Final eventsWithPayments:', eventsWithPayments.length);
      
      // Also calculate total earnings from ALL payments to this user (not just event-based)
      const allPayments = await Payment.find({ to_user: creator._id });
      const totalAllEarnings = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
      console.log('DEBUG: Total earnings from all payments:', totalAllEarnings);
      
      return {
        events: eventsWithPayments,
        totalEarnings: totalAllEarnings,
        totalPayments: allPayments.length
      };
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return type === 'current' ? null : [];
  }
};

export const createEvent = async (eventData) => {
  try {
    const { getServerSession } = await import('next-auth/next');
    const { nextAuthConfig } = await import('@/app/api/auth/[...nextauth]/route');
    const connectDB = (await import('@/db/ConnectDb')).default;
    const Event = (await import('@/models/Event')).default;
    const User = (await import('@/models/User')).default;

    await connectDB();
    const session = await getServerSession(nextAuthConfig);
    
    if (!session?.user?.email) {
      throw new Error('Unauthorized');
    }

    // Get the creator's user ID
    const creator = await User.findOne({ email: session.user.email });
    if (!creator) {
      throw new Error('User not found');
    }

    // Check if user already has an active event
    const existingEvent = await Event.findOne({ 
      creatorId: creator._id, 
      status: 'active' 
    });
    
    if (existingEvent) {
      throw new Error('You already have an active event. Please end your current event before creating a new one.');
    }

    // Create new event
    const newEvent = new Event({
      ...eventData,
      creatorId: creator._id,
      status: 'active',
      createdAt: new Date()
    });

    await newEvent.save();
    
    // Convert to plain object to avoid serialization issues
    const plainEvent = newEvent.toObject();
    return {
      _id: plainEvent._id.toString(),
      title: plainEvent.title,
      perkDescription: plainEvent.perkDescription,
      startTime: plainEvent.startTime.toISOString(),
      endTime: plainEvent.endTime.toISOString(),
      status: plainEvent.status,
      creatorId: plainEvent.creatorId.toString(),
      createdAt: plainEvent.createdAt.toISOString(),
      updatedAt: plainEvent.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const endEvent = async (eventId) => {
  try {
    const { getServerSession } = await import('next-auth/next');
    const { nextAuthConfig } = await import('@/app/api/auth/[...nextauth]/route');
    const connectDB = (await import('@/db/ConnectDb')).default;
    const Event = (await import('@/models/Event')).default;
    const User = (await import('@/models/User')).default;

    await connectDB();
    const session = await getServerSession(nextAuthConfig);
    
    if (!session?.user?.email) {
      throw new Error('Unauthorized');
    }

    // Get the creator's user ID
    const creator = await User.findOne({ email: session.user.email });
    if (!creator) {
      throw new Error('User not found');
    }

    // Find and update the event
    const event = await Event.findOne({ 
      _id: eventId, 
      creatorId: creator._id 
    });
    
    if (!event) {
      throw new Error('Event not found or you do not have permission to end this event.');
    }

    event.status = 'completed';
    const actualEndTime = new Date();
    event.endedAt = actualEndTime;
    event.endTime = actualEndTime; // Update endTime to actual end time
    await event.save();

    // Also clear eventStart and eventEnd in the User document
    await User.updateOne(
      { _id: creator._id },
      { $set: { eventStart: null, eventEnd: null } }
    );

    // Convert to plain object to avoid serialization issues
    const plainEvent = event.toObject();
    return {
      _id: plainEvent._id.toString(),
      title: plainEvent.title,
      perkDescription: plainEvent.perkDescription,
      startTime: plainEvent.startTime.toISOString(),
      endTime: plainEvent.endTime.toISOString(),
      status: plainEvent.status,
      creatorId: plainEvent.creatorId.toString(),
      createdAt: plainEvent.createdAt.toISOString(),
      updatedAt: plainEvent.updatedAt.toISOString(),
      endedAt: plainEvent.endedAt?.toISOString()
    };
  } catch (error) {
    console.error('Error ending event:', error);
    throw error;
  }
};
