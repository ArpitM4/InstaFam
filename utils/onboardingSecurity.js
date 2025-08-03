/**
 * Security utilities for onboarding and discount code system
 */

// Rate limiting for discount code attempts
const attemptTracking = new Map();

export const rateLimitDiscountAttempts = (userEmail, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const userAttempts = attemptTracking.get(userEmail) || { count: 0, resetTime: now + windowMs };

  // Reset if window has passed
  if (now > userAttempts.resetTime) {
    userAttempts.count = 0;
    userAttempts.resetTime = now + windowMs;
  }

  userAttempts.count++;
  attemptTracking.set(userEmail, userAttempts);

  if (userAttempts.count > maxAttempts) {
    const remainingTime = Math.ceil((userAttempts.resetTime - now) / 1000 / 60);
    throw new Error(`Too many attempts. Please try again in ${remainingTime} minutes.`);
  }

  return {
    attemptsRemaining: maxAttempts - userAttempts.count,
    resetTime: userAttempts.resetTime
  };
};

// Server-side onboarding validation
export const validateOnboardingProgress = async (userId) => {
  // This would typically connect to your database
  // and validate each step independently
  const validationResults = {
    isVerified: false,
    paymentDetailsAdded: false,
    profilePageCreated: false,
    firstEventStarted: false,
    firstVaultItemAdded: false
  };

  // Add your validation logic here
  // Example: Check database for verification status, payment info, etc.
  
  return validationResults;
};

// Audit trail for discount code usage
export const logDiscountCodeUsage = async (userEmail, code, action, result) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userEmail,
    code,
    action, // 'attempt', 'success', 'failure'
    result,
    ip: null, // Would be populated in API route
    userAgent: null // Would be populated in API route
  };

  // In a real application, you'd save this to your database
  console.log('Discount Code Audit:', logEntry);
  
  return logEntry;
};

// Prevent manipulation of client-side progress
export const verifyProgressIntegrity = (clientProgress, serverProgress) => {
  const differences = [];
  
  Object.keys(clientProgress).forEach(key => {
    if (clientProgress[key] !== serverProgress[key]) {
      differences.push({
        field: key,
        clientValue: clientProgress[key],
        serverValue: serverProgress[key]
      });
    }
  });

  if (differences.length > 0) {
    console.warn('Progress integrity check failed:', differences);
    return false;
  }

  return true;
};
