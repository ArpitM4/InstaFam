"use client";
import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

export default function GoogleOneTap() {
  const { status } = useSession();
  const [debugInfo, setDebugInfo] = useState('Component loading...');
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [clientIdSet, setClientIdSet] = useState(false);

  useEffect(() => {
    console.log('GoogleOneTap component mounted, session status:', status);
    
    // Check environment variables
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_ID;
    console.log('Client ID:', clientId);
    setClientIdSet(!!clientId);
    
    if (status === 'unauthenticated') {
      console.log('User is unauthenticated, initializing Google One Tap...');
      setDebugInfo('User unauthenticated, starting...');
      
      // Initialize Google One Tap when script is loaded
      const initializeGoogleOneTap = () => {
        console.log('Checking if Google API is available:', !!window.google?.accounts?.id);
        setGoogleAvailable(!!window.google?.accounts?.id);
        
        if (window.google?.accounts?.id) {
          console.log('Google API found, initializing One Tap with client ID:', clientId);
          setDebugInfo('Google API found, initializing...');
          
          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: async (response) => {
                console.log('Google One Tap response received:', response);
                setDebugInfo('Google response received, signing in...');
                
                try {
                  const result = await signIn('googleonetap', {
                    credential: response.credential,
                    redirect: false,
                  });
                  console.log('SignIn result:', result);
                  setDebugInfo(`SignIn result: ${result?.ok ? 'Success' : 'Failed'}`);
                } catch (signInError) {
                  console.error('SignIn error:', signInError);
                  setDebugInfo(`SignIn error: ${signInError.message}`);
                }
              },
              auto_select: false,
              cancel_on_tap_outside: false,
            });
            
            console.log('Google One Tap initialized, now prompting...');
            setDebugInfo('Initialized, prompting...');
            
            // Prompt the One Tap UI
            window.google.accounts.id.prompt((notification) => {
              console.log('Google One Tap notification:', notification);
              
              try {
                if (notification.isNotDisplayed && notification.isNotDisplayed()) {
                  console.log('Google One Tap not displayed');
                  setDebugInfo('Not displayed - user signed out/incognito/dismissed');
                } else if (notification.isSkippedMoment && notification.isSkippedMoment()) {
                  console.log('Google One Tap skipped');
                  setDebugInfo('Skipped - user dismissed recently');
                } else if (notification.isDismissedMoment && notification.isDismissedMoment()) {
                  console.log('Google One Tap dismissed');
                  setDebugInfo('Dismissed by user');
                } else {
                  console.log('Google One Tap displayed successfully');
                  setDebugInfo('Displayed successfully!');
                }
              } catch (notificationError) {
                console.error('Notification error:', notificationError);
                setDebugInfo(`Notification error: ${notificationError.message}`);
              }
            });
          } catch (error) {
            console.error('Error initializing Google One Tap:', error);
            setDebugInfo(`Initialization error: ${error.message}`);
          }
        } else {
          console.log('Google API not available yet');
          setDebugInfo('Google API not available');
          setGoogleAvailable(false);
        }
      };

      // Check if Google script is already loaded
      if (window.google?.accounts?.id) {
        console.log('Google script already loaded');
        setDebugInfo('Google script already loaded');
        initializeGoogleOneTap();
      } else {
        console.log('Waiting for Google script to load...');
        setDebugInfo('Waiting for Google script...');
        
        let checkCount = 0;
        const checkGoogleLoaded = setInterval(() => {
          checkCount++;
          console.log(`Checking for Google script... attempt ${checkCount}`);
          
          if (window.google?.accounts?.id) {
            console.log('Google script loaded after waiting');
            setDebugInfo('Google script loaded!');
            clearInterval(checkGoogleLoaded);
            initializeGoogleOneTap();
          } else if (checkCount >= 100) { // 10 seconds
            console.log('Timeout reached, stopping Google script check');
            setDebugInfo('Timeout - Google script failed to load');
            setGoogleAvailable(false);
            clearInterval(checkGoogleLoaded);
          }
        }, 100);
      }
    } else {
      console.log('User is authenticated or loading, not showing Google One Tap');
      setDebugInfo(`Session status: ${status}`);
    }
  }, [status]);

  const manualTrigger = () => {
    console.log('Manual trigger clicked');
    setDebugInfo('Manual trigger clicked...');
    
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          console.log('Manual prompt notification:', notification);
          setDebugInfo('Manual prompt triggered');
        });
      } catch (error) {
        console.error('Manual trigger error:', error);
        setDebugInfo(`Manual trigger error: ${error.message}`);
      }
    } else {
      console.log('Google API not available for manual trigger');
      setDebugInfo('Google API not available for manual trigger');
    }
  };

  // Show debug info only in development and for unauthenticated users
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        left: '20px', 
        background: 'black', 
        padding: '15px', 
        border: '2px solid #333',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 1000,
        maxWidth: '300px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
          Google One Tap Debug
        </div>
        <div style={{ marginBottom: '5px' }}>
          <strong>Status:</strong> {status || 'Unknown'}
        </div>
        <div style={{ marginBottom: '5px' }}>
          <strong>Debug:</strong> {debugInfo}
        </div>
        <div style={{ marginBottom: '5px' }}>
          <strong>Google API:</strong> {googleAvailable ? '✅ Available' : '❌ Not Available'}
        </div>
        <div style={{ marginBottom: '5px' }}>
          <strong>Client ID:</strong> {clientIdSet ? '✅ Set' : '❌ Not Set'}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Environment:</strong> {process.env.NODE_ENV}
        </div>
        {status === 'unauthenticated' && (
          <button 
            onClick={manualTrigger} 
            style={{ 
              padding: '8px 12px',
              background: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Manual Trigger
          </button>
        )}
      </div>
    );
  }

  return null; // This component doesn't render anything itself in production
}
