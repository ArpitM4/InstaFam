"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailSignup = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Use NextAuth's signIn with email provider
      const result = await signIn('email', { 
        email, 
        redirect: false,
        callbackUrl: '/dashboard' // Where to redirect after verification
      });

      if (result?.error) {
        setError("Failed to send verification email. Please try again.");
      } else {
        // Redirect to the verification page with email parameter
        router.push(`/auth/verify-request?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error('Email signup error:', error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleEmailSignup();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-4 pb-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-light text-primary mb-3">Create account</h1>
          <p className="text-text/60">Enter your email to get started - we'll send you a magic link</p>
        </div>

        {/* Signup Form */}
        <div className="bg-dropdown-hover rounded-lg p-6 space-y-5 shadow-sm">
          {error && (
            <div className="bg-red-500/10 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text/70 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="w-full px-3 py-3 rounded-lg bg-background/50 text-text placeholder-text/40 focus:outline-none focus:bg-background transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                required
                autoComplete="email"
              />
              <p className="text-xs text-text/50 mt-1">We'll send you a secure magic link to create your account</p>
            </div>
          </div>

          <button
            onClick={handleEmailSignup}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                Sending magic link...
              </div>
            ) : (
              'Send Magic Link'
            )}
          </button>
        </div>

        {/* Sign in link */}
        <div className="text-center">
          <p className="text-text/50">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>

        {/* Terms notice */}
        <div className="text-center">
          <p className="text-xs text-text/40">
            By signing up, you agree to our{" "}
            <a href="/terms" className="text-primary hover:text-primary/80 transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacypolicy" className="text-primary hover:text-primary/80 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
