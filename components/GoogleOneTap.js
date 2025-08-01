"use client";

import { useEffect, useRef, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function GoogleOneTap() {
  const { status } = useSession();
  const router = useRouter();
  const initialized = useRef(false); // Use a ref to track if initialization has happened
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Define the callback handler as a separate function
  const handleCredentialResponse = async (response) => {
    try {
      setIsAuthenticating(true);
      
      const res = await signIn('googleonetap', {
        credential: response.credential,
        redirect: false, // This is crucial to prevent page reload
      });

      if (res?.error) {
        console.error("One Tap Sign-In Error from NextAuth:", res.error);
        setIsAuthenticating(false);
        // Optional: Add a toast notification for the user here if login fails
      } else if (res?.ok) {
        // Success! Wait a moment for session to update, then redirect
        setTimeout(() => {
          setIsAuthenticating(false); // Clear loading state before redirect
          router.push('/account');
        }, 1000);
      } else {
        // Handle unexpected response
        setIsAuthenticating(false);
      }
    } catch (error) {
      console.error("A critical error occurred in the One Tap callback:", error);
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    // We only want this effect to run if the user is unauthenticated
    // AND we haven't initialized the script yet.
    if (status === 'unauthenticated' && !initialized.current) {
      
      // Add CSS to ensure navbar stays on top and shift Google One Tap down
      const style = document.createElement('style');
      style.textContent = `
        nav, .navbar, header {
          z-index: 1000000 !important;
          position: relative !important;
        }
        #credential_picker_container {
          top: 60px !important;
        }
        .fedcm-idp-signin-status {
          top: 60px !important;
        }
      `;
      document.head.appendChild(style);
      
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

  // This component renders nothing to the page itself, except loading state
  return isAuthenticating ? (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000001]">
      <div className="bg-dropdown-hover rounded-lg p-6 flex items-center space-x-3">
        <div className="animate-spin h-5 w-5 rounded-full border-2 border-primary border-t-transparent"></div>
        <span className="text-text">Signing you in...</span>
      </div>
    </div>
  ) : null; 
}
