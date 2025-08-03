'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const useCreatorOnboarding = () => {
  const { data: session } = useSession();
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch onboarding progress
  const fetchProgress = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/creator/onboarding');
      if (response.ok) {
        const data = await response.json();
        setOnboarding(data.onboarding);
      } else {
        setError('Failed to fetch onboarding progress');
      }
    } catch (err) {
      setError('Network error while fetching progress');
      console.error('Onboarding fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update progress
  const updateProgress = async () => {
    if (!session?.user) return null;

    try {
      const response = await fetch('/api/creator/onboarding', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setOnboarding(prev => ({
          ...prev,
          checklist: data.checklist,
          onboardingCompleted: data.onboardingCompleted
        }));
        return data;
      }
    } catch (err) {
      console.error('Progress update error:', err);
      return null;
    }
  };

  // Check if user should see onboarding
  const shouldShowOnboarding = () => {
    if (!session?.user || !onboarding) return false;
    
    // Show only for creators who haven't completed onboarding
    return session.user.accountType === 'Creator' && !onboarding.onboardingCompleted;
  };

  // Get completion stats
  const getCompletionStats = () => {
    if (!onboarding?.checklist) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = Object.values(onboarding.checklist).filter(Boolean).length;
    const total = Object.keys(onboarding.checklist).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  };

  // Get incomplete steps
  const getIncompleteSteps = () => {
    if (!onboarding?.checklist) return [];
    
    const stepNames = {
      isVerified: 'Get Account Verified',
      paymentDetailsAdded: 'Add Payment Details',
      profilePageCreated: 'Complete Profile Page',
      firstEventStarted: 'Start First Event',
      firstVaultItemAdded: 'Add Vault Item'
    };

    return Object.entries(onboarding.checklist)
      .filter(([_, completed]) => !completed)
      .map(([key, _]) => stepNames[key] || key);
  };

  useEffect(() => {
    fetchProgress();
  }, [session]);

  return {
    onboarding,
    loading,
    error,
    fetchProgress,
    updateProgress,
    shouldShowOnboarding,
    getCompletionStats,
    getIncompleteSteps
  };
};
