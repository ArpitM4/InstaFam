/**
 * Real-time validation hooks for creator onboarding
 * These functions should be called when users perform relevant actions
 */

// Helper function to update onboarding progress
export const updateOnboardingProgress = async () => {
  try {
    const response = await fetch('/api/creator/onboarding', {
      method: 'POST'
    });
    
    if (response.ok) {
      const data = await response.json();
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('onboardingUpdated', { 
        detail: data 
      }));
      return data;
    }
  } catch (error) {
    console.error('Failed to update onboarding progress:', error);
  }
  return null;
};

// Trigger when profile is updated
export const triggerProfileUpdate = async () => {
  console.log('Profile updated - checking onboarding progress...');
  return await updateOnboardingProgress();
};

// Trigger when payment info is added/updated
export const triggerPaymentUpdate = async () => {
  console.log('Payment info updated - checking onboarding progress...');
  return await updateOnboardingProgress();
};

// Trigger when verification is completed
export const triggerVerificationUpdate = async () => {
  console.log('Verification completed - checking onboarding progress...');
  return await updateOnboardingProgress();
};

// Trigger when event is started
export const triggerEventUpdate = async () => {
  console.log('Event started - checking onboarding progress...');
  return await updateOnboardingProgress();
};

// Trigger when vault item is added
export const triggerVaultUpdate = async () => {
  console.log('Vault item added - checking onboarding progress...');
  return await updateOnboardingProgress();
};
