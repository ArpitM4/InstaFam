"use client";
import { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';

export default function GoogleOneTap() {
  const { status } = useSession();

  useEffect(() => {
    // Only show Google One Tap for unauthenticated users
    if (status === 'unauthenticated') {
      // Add CSS to ensure navbar stays on top
      const style = document.createElement('style');
      style.textContent = `
        nav, .navbar, header {
          z-index: 1000000 !important;
          position: relative !important;
        }
        #credential_picker_container {
          top: 65px !important;
        }
      `;
      document.head.appendChild(style);
      
      // Get client ID from environment variables
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        console.error('Google Client ID not found in environment variables');
        return;
      }

      // Initialize Google One Tap when script is loaded
      const initializeGoogleOneTap = () => {
        if (window.google?.accounts?.id) {
          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: async (response) => {
                try {
                  // Use the normal signIn flow without redirect: false
                  // This will handle the OAuth flow properly
                  await signIn('googleonetap', {
                    credential: response.credential,
                    callbackUrl: '/account'
                  });
                } catch (signInError) {
                  console.error('Google One Tap sign-in error:', signInError);
                }
              },
              auto_select: false,
              cancel_on_tap_outside: false,
              // Position the popup to avoid navbar overlap
              ux_mode: 'popup',
              context: 'signin'
            });
            
            // Prompt the One Tap UI with custom positioning and delay
            setTimeout(() => {
              window.google.accounts.id.prompt({
                moment_callback: (notification) => {
                  // Handle different notification states
                  if (notification.isNotDisplayed()) {
                    // One Tap could not be displayed
                    console.log('One Tap not displayed');
                  } else if (notification.isSkippedMoment()) {
                    // One Tap was skipped
                    console.log('One Tap skipped');
                  }
                }
              });
            }, 1000); // 1 second delay to ensure page is fully loaded
          } catch (error) {
            console.error('Error initializing Google One Tap:', error);
          }
        }
      };

      // Check if Google script is already loaded
      if (window.google?.accounts?.id) {
        initializeGoogleOneTap();
      } else {
        // Wait for Google script to load
        let checkCount = 0;
        const checkGoogleLoaded = setInterval(() => {
          checkCount++;
          
          if (window.google?.accounts?.id) {
            clearInterval(checkGoogleLoaded);
            initializeGoogleOneTap();
          } else if (checkCount >= 100) { // 10 seconds timeout
            clearInterval(checkGoogleLoaded);
          }
        }, 100);
      }
    }
  }, [status]);

  return null; // This component doesn't render anything
}
