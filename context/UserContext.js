"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { fetchuser } from '@/actions/useractions';
import { eventBus, EVENTS } from '@/utils/eventBus';

const UserContext = createContext({});

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [userData, setUserData] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(0);

  // Function to refresh user data
  const refreshUserData = async (force = false) => {
    if (!session?.user?.name) {
      setUserData(null);
      setUserPoints(0);
      setIsLoading(false);
      return;
    }

    // Prevent too frequent refreshes unless forced
    const now = Date.now();
    if (!force && now - lastFetch < 2000) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 UserContext: Refreshing user data for:', session.user.name);
      
      // Fetch user data
      const user = await fetchuser(session.user.name);
      setUserData(user);
      setLastFetch(now);
      
      // Fetch user points
      try {
        const pointsRes = await fetch('/api/points', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        if (pointsRes.ok) {
          const pointsData = await pointsRes.json();
          setUserPoints(pointsData.totalPoints || 0);
          console.log('🔄 UserContext: Updated points:', pointsData.totalPoints || 0);
        }
      } catch (error) {
        console.error('Failed to fetch points:', error);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      setUserData(null);
      setUserPoints(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update points without full refresh
  const updatePoints = async () => {
    try {
      const pointsRes = await fetch('/api/points', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      if (pointsRes.ok) {
        const pointsData = await pointsRes.json();
        setUserPoints(pointsData.totalPoints || 0);
        console.log('🔄 UserContext: Points updated:', pointsData.totalPoints || 0);
      }
    } catch (error) {
      console.error('Failed to update points:', error);
    }
  };

  // Function to update user data (e.g., after profile changes)
  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
    console.log('🔄 UserContext: User data updated:', newData);
  };

  // Initial data fetch when session changes
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'authenticated' && session?.user?.name) {
      refreshUserData(true);
    } else {
      setUserData(null);
      setUserPoints(0);
      setIsLoading(false);
    }
  }, [session, status]);

  // Refresh data when session user changes
  useEffect(() => {
    if (session?.user?.name && userData?.username !== session.user.name) {
      refreshUserData(true);
    }
  }, [session?.user?.name]);

  // Refresh user data when navigating to dashboard or account pages
  useEffect(() => {
    if (session?.user?.name && (pathname === '/dashboard' || pathname === '/account')) {
      refreshUserData(true);
    }
  }, [pathname, session?.user?.name]);

  // Listen to global events for updates
  useEffect(() => {
    const handlePaymentSuccess = () => {
      updatePoints();
    };

    const handleProfileUpdate = () => {
      refreshUserData(true);
    };

    const handleAccountTypeChange = ({ accountType }) => {
      setUserData(prev => ({ ...prev, accountType }));
    };

    const handlePointsUpdate = ({ points }) => {
      setUserPoints(points);
    };

    // Subscribe to events
    eventBus.on(EVENTS.PAYMENT_SUCCESS, handlePaymentSuccess);
    eventBus.on(EVENTS.PROFILE_UPDATE, handleProfileUpdate);
    eventBus.on(EVENTS.ACCOUNT_TYPE_CHANGE, handleAccountTypeChange);
    eventBus.on(EVENTS.POINTS_UPDATE, handlePointsUpdate);

    // Cleanup
    return () => {
      eventBus.off(EVENTS.PAYMENT_SUCCESS, handlePaymentSuccess);
      eventBus.off(EVENTS.PROFILE_UPDATE, handleProfileUpdate);
      eventBus.off(EVENTS.ACCOUNT_TYPE_CHANGE, handleAccountTypeChange);
      eventBus.off(EVENTS.POINTS_UPDATE, handlePointsUpdate);
    };
  }, []);

  const value = {
    userData,
    userPoints,
    isLoading: isLoading || status === 'loading',
    refreshUserData,
    updatePoints,
    updateUserData,
    accountType: userData?.accountType,
    isAuthenticated: status === 'authenticated',
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
