import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/db/ConnectDb';
import User from '@/models/User';
import DiscountCode from '@/models/DiscountCode';
import { rateLimitDiscountAttempts, logDiscountCodeUsage } from '@/utils/onboardingSecurity';

export async function POST(req) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Discount code is required' }, { status: 400 });
    }

    // Rate limiting
    try {
      const rateLimitInfo = rateLimitDiscountAttempts(session.user.email);
      console.log(`Discount attempts remaining: ${rateLimitInfo.attemptsRemaining}`);
    } catch (rateLimitError) {
      await logDiscountCodeUsage(session.user.email, code, 'rate_limited', rateLimitError.message);
      return NextResponse.json({ 
        error: 'Rate limit exceeded',
        message: rateLimitError.message
      }, { status: 429 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found:', { email: user.email, accountType: user.accountType });

    // Find the discount code
    console.log('Looking for discount code:', code.toUpperCase());
    const discountCode = await DiscountCode.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    console.log('Discount code found:', discountCode ? {
      code: discountCode.code,
      isActive: discountCode.isActive,
      description: discountCode.description
    } : 'Not found');

    if (!discountCode) {
      // Let's also check if code exists but is inactive
      const inactiveCode = await DiscountCode.findOne({ code: code.toUpperCase() });
      console.log('Inactive code check:', inactiveCode ? 'Found but inactive' : 'Not found at all');
      
      return NextResponse.json({ 
        error: 'Invalid discount code',
        message: 'The discount code you entered is not valid or has expired.',
        debug: {
          searchedCode: code.toUpperCase(),
          foundInactive: !!inactiveCode
        }
      }, { status: 400 });
    }

    // Check if code has expired
    if (discountCode.validUntil && new Date() > discountCode.validUntil) {
      return NextResponse.json({ 
        error: 'Expired discount code',
        message: 'This discount code has expired.'
      }, { status: 400 });
    }

    // Check usage limit
    if (discountCode.usageLimit && discountCode.usedCount >= discountCode.usageLimit) {
      return NextResponse.json({ 
        error: 'Usage limit exceeded',
        message: 'This discount code has reached its usage limit.'
      }, { status: 400 });
    }

    // Check if user already used this code
    if (user.creatorOnboarding?.discountCode === code.toUpperCase()) {
      return NextResponse.json({ 
        error: 'Already applied',
        message: 'You have already applied this discount code.'
      }, { status: 400 });
    }

    // Check account type requirement
    if (discountCode.eligibilityCriteria.accountTypeRequired && 
        user.accountType !== discountCode.eligibilityCriteria.accountTypeRequired) {
      return NextResponse.json({ 
        error: 'Account type requirement not met',
        message: `This code is only available for ${discountCode.eligibilityCriteria.accountTypeRequired} accounts.`
      }, { status: 400 });
    }

    // Check onboarding completion requirement (special handling for FIRST50)
    if (discountCode.eligibilityCriteria.requiresOnboardingCompletion || code.toUpperCase() === 'FIRST50') {
      const isOnboardingCompleted = user.creatorOnboarding?.onboardingCompleted || false;
      
      if (!isOnboardingCompleted) {
        // Return detailed checklist for incomplete onboarding
        const checklist = user.creatorOnboarding?.checklist || {
          isVerified: false,
          paymentDetailsAdded: false,
          profilePageCreated: false,
          firstEventStarted: false,
          firstVaultItemAdded: false
        };

        const incompleteSteps = [];
        if (!checklist.isVerified) incompleteSteps.push('Get your account verified');
        if (!checklist.paymentDetailsAdded) incompleteSteps.push('Add payment details');
        if (!checklist.profilePageCreated) incompleteSteps.push('Complete your profile page');
        if (!checklist.firstEventStarted) incompleteSteps.push('Start your first event');
        if (!checklist.firstVaultItemAdded) incompleteSteps.push('Add an item to your vault');

        return NextResponse.json({ 
          error: 'Onboarding incomplete',
          message: 'First you need to complete all these steps.',
          incompleteSteps,
          checklist,
          showChecklist: true
        }, { status: 400 });
      }
    }

    // Apply the discount code
    await User.findByIdAndUpdate(user._id, {
      'creatorOnboarding.discountCode': code.toUpperCase()
    });

    // Increment usage count
    await DiscountCode.findByIdAndUpdate(discountCode._id, {
      $inc: { usedCount: 1 }
    });

    return NextResponse.json({
      success: true,
      message: 'Discount code applied successfully!',
      code: code.toUpperCase(),
      description: discountCode.description,
      discountType: discountCode.discountType,
      discountValue: discountCode.discountValue
    });

  } catch (error) {
    console.error('Error applying discount code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
