import { NextResponse } from 'next/server';
import connectDB from '@/db/ConnectDb';
import DiscountCode from '@/models/DiscountCode';

export async function POST(req) {
  try {
    await connectDB();
    
    // Create FIRST50 discount code if it doesn't exist
    const existingCode = await DiscountCode.findOne({ code: 'FIRST50' });
    
    if (!existingCode) {
      await DiscountCode.create({
        code: 'FIRST50',
        description: 'Welcome reward for completing creator onboarding',
        discountType: 'percentage',
        discountValue: 50,
        usageLimit: null, // Unlimited usage
        eligibilityCriteria: {
          requiresOnboardingCompletion: true,
          accountTypeRequired: 'Creator'
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'FIRST50 discount code created successfully!' 
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        message: 'FIRST50 discount code already exists' 
      });
    }

  } catch (error) {
    console.error('Error initializing discount code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
