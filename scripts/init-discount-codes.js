/**
 * Database initialization script for discount codes
 * Run this script once to set up the FIRST50 discount code
 */

import connectDB from '../db/ConnectDb.js';
import DiscountCode from '../models/DiscountCode.js';

async function initializeDiscountCodes() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Create FIRST50 discount code if it doesn't exist
    const existingCode = await DiscountCode.findOne({ code: 'FIRST50' });
    
    if (!existingCode) {
      await DiscountCode.create({
        code: 'FIRST50',
        description: 'Welcome reward for completing creator onboarding - 50% off your first purchase',
        discountType: 'percentage',
        discountValue: 50,
        usageLimit: null, // Unlimited usage
        eligibilityCriteria: {
          requiresOnboardingCompletion: true,
          accountTypeRequired: 'Creator'
        }
      });

      console.log('✅ FIRST50 discount code created successfully!');
    } else {
      console.log('ℹ️  FIRST50 discount code already exists');
    }

    // You can add more discount codes here
    console.log('🎉 Discount code initialization completed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error initializing discount codes:', error);
    process.exit(1);
  }
}

initializeDiscountCodes();
