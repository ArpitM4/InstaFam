"use client";

import { useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';

export default function GoogleOneTap() {
  const { status } = useSession();
  const initialized = useRef(false); // Use a ref to track if initialization has happened

  // Define the callback handler as a separate function
  const handleCredentialResponse = async (response) => {
    try {
      const res = await signIn('googleonetap', {
        credential: response.credential,
        redirect: false, // This is crucial to prevent page reload
      });

      if (res?.error) {
        console.error("One Tap Sign-In Error from NextAuth:", res.error);
        // Optional: Add a toast notification for the user here if login fails
      }
      // On success, the useSession hook will automatically update,
      // and your UI will change to the logged-in state. No reload needed.
    } catch (error) {
      console.error("A critical error occurred in the One Tap callback:", error);
    }
  };

  useEffect(() => {
    // We only want this effect to run if the user is unauthenticated
    // AND we haven't initialized the script yet.
    if (status === 'unauthenticated' && !initialized.current) {
      
      // Check if the Google Identity Services library is available on the window object
      if (window.google?.accounts?.id) {
        // Mark as initialized so this doesn't run again on re-renders
        initialized.current = true; 
        
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_ID,
            callback: handleCredentialResponse, // Pass our handler function
          });

          // Prompt the One Tap UI to appear
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              console.log('Google One Tap prompt was not displayed. This can happen if the user has disabled third-party cookies or has dismissed the prompt previously.');
            }
          });
        } catch (error) {
          console.error('Error initializing Google One Tap:', error);
          initialized.current = false; // Reset so it can try again
        }
      } else {
        // Google script not loaded yet, wait a bit and try again
        const timeout = setTimeout(() => {
          if (window.google?.accounts?.id && !initialized.current) {
            initialized.current = true;
            
            try {
              window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_ID,
                callback: handleCredentialResponse,
              });

              window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                  console.log('Google One Tap prompt was not displayed (delayed init).');
                }
              });
            } catch (error) {
              console.error('Error in delayed Google One Tap initialization:', error);
              initialized.current = false;
            }
          }
        }, 1000);

        return () => clearTimeout(timeout);
      }
    }
  }, [status]);

  // This component renders nothing to the page itself
  return null; 
}
