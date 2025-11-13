import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';
import VaultItem from '@/models/VaultItem';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return current onboarding progress
    return NextResponse.json({
      success: true,
      onboarding: user.creatorOnboarding || {
        discountCode: null,
        onboardingCompleted: false,
        checklist: {
          isVerified: false,
          paymentDetailsAdded: false,
          profilePageCreated: false,
          firstEventStarted: false,
          firstVaultItemAdded: false
        },
        onboardingStartedAt: null,
        onboardingCompletedAt: null
      }
    });

  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Auto-validate all checklist items
    const updatedChecklist = await validateChecklistItems(user);

    // Check if onboarding should be marked as completed
    const allStepsCompleted = Object.values(updatedChecklist).every(step => step === true);
    
    const updateData = {
      'creatorOnboarding.checklist': updatedChecklist,
      'creatorOnboarding.onboardingCompleted': allStepsCompleted
    };

    // Set start time if this is the first update
    if (!user.creatorOnboarding?.onboardingStartedAt) {
      updateData['creatorOnboarding.onboardingStartedAt'] = new Date();
    }

    // Set completion time if just completed
    if (allStepsCompleted && !user.creatorOnboarding?.onboardingCompleted) {
      updateData['creatorOnboarding.onboardingCompletedAt'] = new Date();
    }

    await User.findByIdAndUpdate(user._id, updateData);

    return NextResponse.json({
      success: true,
      checklist: updatedChecklist,
      onboardingCompleted: allStepsCompleted,
      justCompleted: allStepsCompleted && !user.creatorOnboarding?.onboardingCompleted
    });

  } catch (error) {
    console.error('Error updating onboarding progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function validateChecklistItems(user) {
  const checklist = {
    isVerified: false,
    paymentDetailsAdded: false,
    profilePageCreated: false,
    firstEventStarted: false,
    firstVaultItemAdded: false
  };

  // Step 1: Account Verification
  checklist.isVerified = !!(user.emailVerified && user.instagram?.isVerified);

  // Step 2: Payment Details
  checklist.paymentDetailsAdded = !!(user.paymentInfo?.upi || user.paymentInfo?.phone);

  // Step 3: Profile Page Creation
  const hasCustomProfile = user.username && 
                          user.description !== "Welcome to my Sygil" && 
                          user.profilepic !== "https://picsum.photos/200";
  checklist.profilePageCreated = hasCustomProfile;

  // Step 4: First Event Started
  checklist.firstEventStarted = !!user.eventStart;

  // Step 5: First Vault Item Added
  const vaultItemCount = await VaultItem.countDocuments({ creatorId: user._id });
  checklist.firstVaultItemAdded = vaultItemCount > 0;

  return checklist;
}
