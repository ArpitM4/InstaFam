import { NextResponse } from 'next/server';
import connectDB from '@/db/ConnectDb';
import DiscountCode from '@/models/DiscountCode';

export async function POST(req) {
  try {
    console.log('=== DISCOUNT CODE INITIALIZATION DEBUG ===');
    console.log('1. Starting initialization...');
    
    console.log('2. Connecting to database...');
    await connectDB();
    console.log('3. Database connected successfully');
    
    console.log('4. DiscountCode model:', DiscountCode);
    console.log('5. Checking for existing FIRST50 code...');
    
    // Check if FIRST50 already exists
    const existingCode = await DiscountCode.findOne({ code: 'FIRST50' });
    console.log('6. Existing FIRST50 code found:', existingCode);
    
    if (!existingCode) {
      console.log('7. Creating new FIRST50 code...');
      const codeData = {
        code: 'FIRST50',
        description: 'Welcome reward for completing creator onboarding - 50% off your first purchase',
        discountType: 'percentage',
        discountValue: 50,
        usageLimit: null, // Unlimited usage
        isActive: true, // Make sure it's active
        eligibilityCriteria: {
          requiresOnboardingCompletion: true,
          accountTypeRequired: 'Creator'
        }
      };
      
      console.log('8. Code data to create:', codeData);
      
      const newCode = await DiscountCode.create(codeData);
      console.log('9. FIRST50 code created successfully:', newCode);

      return NextResponse.json({ 
        success: true, 
        message: 'FIRST50 discount code created successfully!',
        code: newCode,
        debug: 'Created new code'
      });
    } else {
      console.log('7. Code exists, updating to ensure it\'s active...');
      // Update existing code to ensure it's active
      const updatedCode = await DiscountCode.findByIdAndUpdate(existingCode._id, {
        isActive: true,
        discountType: 'percentage',
        discountValue: 50
      }, { new: true });
      
      console.log('8. Updated existing code:', updatedCode);
      
      return NextResponse.json({ 
        success: true, 
        message: 'FIRST50 discount code already exists and is now active',
        code: updatedCode,
        debug: 'Updated existing code'
      });
    }

  } catch (error) {
    console.error('=== ERROR IN DISCOUNT CODE INITIALIZATION ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

// Also add GET method to check current codes
export async function GET(req) {
  try {
    console.log('=== DISCOUNT CODE CHECK DEBUG ===');
    console.log('1. Starting code check...');
    
    await connectDB();
    console.log('2. Database connected');
    
    console.log('3. DiscountCode model:', DiscountCode);
    console.log('4. Fetching all discount codes...');
    
    const codes = await DiscountCode.find({});
    console.log('5. Found codes:', codes);
    console.log('6. Number of codes found:', codes.length);
    
    const formattedCodes = codes.map(code => {
      console.log('7. Processing code:', code);
      return {
        id: code._id,
        code: code.code,
        description: code.description,
        isActive: code.isActive,
        discountType: code.discountType,
        discountValue: code.discountValue,
        usedCount: code.usedCount,
        eligibilityCriteria: code.eligibilityCriteria,
        createdAt: code.createdAt
      };
    });
    
    console.log('8. Formatted codes:', formattedCodes);
    
    return NextResponse.json({ 
      success: true, 
      codes: formattedCodes,
      totalCount: codes.length,
      debug: 'Fetched all codes successfully'
    });

  } catch (error) {
    console.error('=== ERROR IN DISCOUNT CODE CHECK ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
