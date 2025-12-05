"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  const lastFetchRef = useRef(0);
  const isFetchingRef = useRef(false);
  const initialFetchDoneRef = useRef(false);

  // Function to refresh user data - memoized with useCallback
  const refreshUserData = useCallback(async (force = false) => {
    // Use email for fetching as it's more reliable than name/username
    const userIdentifier = session?.user?.email;
    
    if (!userIdentifier) {
      setUserData(null);
      setUserPoints(0);
      setIsLoading(false);
      return;
    }

    // Prevent too frequent refreshes unless forced (increased to 5 seconds)
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 5000) {
      return;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    
    try {
      // Fetch user data and points in parallel for better performance
      const [user, pointsResponse] = await Promise.all([
        fetchuser(userIdentifier),
        fetch('/api/points', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        }).then(res => res.ok ? res.json() : { totalPoints: 0 }).catch(() => ({ totalPoints: 0 }))
      ]);
      
      setUserData(user);
      setUserPoints(pointsResponse.totalPoints || 0);
      lastFetchRef.current = now;
      initialFetchDoneRef.current = true;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      setUserData(null);
      setUserPoints(0);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [session?.user?.email]);

  // Function to update points without full refresh - optimized
  const updatePoints = useCallback(async () => {
    try {
      const pointsRes = await fetch('/api/points', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (pointsRes.ok) {
        const pointsData = await pointsRes.json();
        setUserPoints(pointsData.totalPoints || 0);
      }
    } catch (error) {
      console.error('Failed to update points:', error);
    }
  }, []);

  // Function to update user data locally without API call
  const updateUserData = useCallback((newData) => {
    setUserData(prev => prev ? { ...prev, ...newData } : newData);
  }, []);

  // SINGLE effect for initial data fetch when session changes
  useEffect(() => {
    // Skip if still loading session
    if (status === 'loading') return;
    
    // Handle unauthenticated state
    if (status !== 'authenticated' || !session?.user?.email) {
      setUserData(null);
      setUserPoints(0);
      setIsLoading(false);
      initialFetchDoneRef.current = false;
      return;
    }
    
    // Only fetch if we haven't done initial fetch for this session
    if (!initialFetchDoneRef.current) {
      refreshUserData(true);
    }
  }, [status, session?.user?.email, refreshUserData]);

  // Separate effect for pathname changes - only trigger on dashboard/account
  useEffect(() => {
    if (
      status === 'authenticated' && 
      session?.user?.email && 
      initialFetchDoneRef.current &&
      (pathname === '/creator/dashboard' || pathname === '/account')
    ) {
      // Use regular refresh (respects throttling)
      refreshUserData(false);
    }
  }, [pathname, status, session?.user?.email, refreshUserData]);

  // Listen to global events for updates
  useEffect(() => {
    const handlePaymentSuccess = () => updatePoints();
    const handleAccountTypeChange = ({ accountType }) => {
      setUserData(prev => prev ? { ...prev, accountType } : prev);
    };
    const handlePointsUpdate = ({ points }) => setUserPoints(points);

    // Subscribe to events
    eventBus.on(EVENTS.PAYMENT_SUCCESS, handlePaymentSuccess);
    eventBus.on(EVENTS.ACCOUNT_TYPE_CHANGE, handleAccountTypeChange);
    eventBus.on(EVENTS.POINTS_UPDATE, handlePointsUpdate);

    // Cleanup
    return () => {
      eventBus.off(EVENTS.PAYMENT_SUCCESS, handlePaymentSuccess);
      eventBus.off(EVENTS.ACCOUNT_TYPE_CHANGE, handleAccountTypeChange);
      eventBus.off(EVENTS.POINTS_UPDATE, handlePointsUpdate);
    };
  }, [updatePoints]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    userData,
    userPoints,
    isLoading: isLoading || status === 'loading',
    refreshUserData,
    updatePoints,
    updateUserData,
    accountType: userData?.accountType,
    isAuthenticated: status === 'authenticated',
  }), [userData, userPoints, isLoading, status, refreshUserData, updatePoints, updateUserData]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
