"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: signup form, 2: OTP verification
  const [otpTimer, setOtpTimer] = useState(0);
  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "User already exists") {
          setError("An account with this email already exists. Please login instead.");
        } else {
          setError(data.error || "Signup failed. Please try again.");
        }
      } else {
        setStep(2); // Move to OTP verification step
        startOtpTimer();
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "OTP verification failed");
      } else {
        // Success! Redirect to login
        alert("Email verified successfully! You can now login.");
        router.push("/login");
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend OTP");
      } else {
        setOtp("");
        startOtpTimer();
        alert("New OTP sent to your email!");
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startOtpTimer = () => {
    setOtpTimer(300); // 5 minutes
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      if (step === 1) {
        handleSignup();
      } else {
        handleVerifyOtp();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-4 pb-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-light text-primary mb-3">
            {step === 1 ? 'Create account' : 'Verify your email'}
          </h1>
          <p className="text-text/60">
            {step === 1 
              ? 'Enter your email and password to get started' 
              : `Enter the 6-digit code sent to ${email}`
            }
          </p>
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

          {step === 1 ? (
            // Step 1: Signup Form
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="w-full px-3 py-3 rounded-lg bg-background/50 text-gray-600 placeholder-text/40 focus:outline-none focus:bg-background transition-all duration-200 border-0 disabled:opacity-50"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="w-full px-3 py-3 rounded-lg bg-background/50 text-gray-600 placeholder-text/40 focus:outline-none focus:bg-background transition-all duration-200 border-0 disabled:opacity-50"
                  required
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="w-full px-3 py-3 rounded-lg bg-background/50 text-gray-600 placeholder-text/40 focus:outline-none focus:bg-background transition-all duration-200 border-0 disabled:opacity-50"
                  required
                  autoComplete="new-password"
                />
                <p className="text-xs text-text/50 mt-1">Password must be at least 6 characters</p>
              </div>

              <button
                onClick={handleSignup}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          ) : (
            // Step 2: OTP Verification
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">Verification Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="w-full px-3 py-3 rounded-lg bg-background/50 text-gray-600 placeholder-text/40 focus:outline-none focus:bg-background transition-all duration-200 border-0 disabled:opacity-50 text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
                <p className="text-xs text-text/50 mt-1">Check your email inbox and spam folder</p>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.length !== 6}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>

              <div className="text-center space-y-2">
                {otpTimer > 0 ? (
                  <p className="text-text/50 text-sm">
                    Resend code in {formatTime(otpTimer)}
                  </p>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-primary hover:text-primary/80 text-sm font-medium disabled:opacity-50"
                  >
                    Resend verification code
                  </button>
                )}
                
                <button
                  onClick={() => setStep(1)}
                  className="block w-full text-text/50 hover:text-text text-sm"
                >
                  ← Back to signup
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sign in link */}
        {step === 1 && (
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
        )}

        {/* Terms notice */}
        {step === 1 && (
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
        )}
      </div>
    </div>
  );
};

export default Signup;
