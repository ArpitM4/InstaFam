"use client";

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function VerifyRequest() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleResendEmail = async () => {
    if (!email) {
      setResendMessage('❌ No email address found. Please try signing up again.');
      return;
    }

    setIsResending(true);
    setResendMessage('');

    try {
      const result = await signIn('email', { 
        email, 
        redirect: false 
      });

      if (result?.error) {
        setResendMessage('❌ Failed to resend email. Please try again.');
      } else {
        setResendMessage('✅ Verification email sent! Check your inbox.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setResendMessage('❌ Something went wrong. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-light text-text mb-3">Check your inbox</h1>
          <p className="text-text/60">
            We've sent a verification link to{' '}
            {email && (
              <span className="font-medium text-primary">{email}</span>
            )}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-dropdown-hover rounded-lg p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-sm font-medium">1</span>
              </div>
              <p className="text-text/70 text-sm">
                Click the verification link in your email to confirm your account
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary text-sm font-medium">2</span>
              </div>
              <p className="text-text/70 text-sm">
                You'll be automatically signed in and can complete your profile setup
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-background/30">
            <p className="text-text/50 text-xs">
              💡 Don't see the email? Check your spam folder or try again with a different email address.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {resendMessage && (
            <div className={`rounded-lg p-3 text-sm ${
              resendMessage.includes('✅') 
                ? 'bg-green-500/10 text-green-400' 
                : 'bg-red-500/10 text-red-400'
            }`}>
              {resendMessage}
            </div>
          )}

          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin -ml-1 mr-3 h-4 w-4 text-primary">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                Sending...
              </div>
            ) : (
              'Resend Email'
            )}
          </button>
          
          <button
            onClick={() => router.push('/signup')}
            className="w-full bg-transparent hover:bg-background/30 text-text/70 py-3 px-4 rounded-lg font-medium transition-all duration-200 border border-background/30"
          >
            Use Different Email
          </button>
        </div>

        {/* Back to sign in */}
        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-text/50 hover:text-primary text-sm transition-colors"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}
