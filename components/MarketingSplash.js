"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import Footer from "@/components/Footer";

import dynamic from "next/dynamic";

const CosmicBackground = dynamic(() => import("@/components/CosmicBackground"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#0a0a15]" />
});

export default function MarketingSplash() {
  const router = useRouter();
  // We'll use 'view' state instead of isLogin now, but for backward compat/transition let's sync them or replace usage.
  // Replacing isLogin usage with view check.
  // const [isLogin, setIsLogin] = useState(true); 
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  // Forgot Password / Resend OTP states
  const [view, setView] = useState('LOGIN'); // 'LOGIN', 'SIGNUP', 'FORGOT_PASSWORD'
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [timer, setTimer] = useState(0);

  // Timer Logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const startTimer = () => setTimer(60);

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      let endpoint = '/api/auth/signup';
      if (view === 'FORGOT_PASSWORD') endpoint = '/api/auth/forgot-password';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: view === 'SIGNUP' ? password : undefined }) // Password needed for signup resend (maybe not? checking api)
        // Actually signup usually requires password to re-create/update user or just email. 
        // Provide both for signup just in case. For forgot-password only email is needed.
      });

      if (!res.ok) throw new Error('Failed to resend OTP');
      startTimer();
      // toast.success('OTP Resent');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handlers
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (forgotStep === 1) {
        // Step 1: Send Email
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong');

        setForgotStep(2);
        startTimer();
      } else if (forgotStep === 2) {
        // Step 2: Verify OTP
        const res = await fetch('/api/auth/verify-reset-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid OTP');

        setForgotStep(3);
      } else if (forgotStep === 3) {
        // Step 3: Reset Password
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, newPassword: password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to reset password');

        // Success - Go to Login
        setView('LOGIN');
        setPassword('');
        setError('Password reset successful! Please login.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleCredentialsAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (view === 'LOGIN') {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password');
        } else {
          setError(result.error);
        }
        setLoading(false);
      } else {
        // Check if setup is needed by fetching user data
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        // Skip setup if user already completed it OR has a username
        if (session?.user?.setupCompleted || session?.user?.hasUsername) {
          router.push('/');
        } else {
          router.push('/setup');
        }
        router.refresh();
      }
    } else if (view === 'SIGNUP') {
      // Signup Flow
      if (!showOtpInput) {
        // Step 1: Send OTP
        try {
          const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          const data = await res.json();

          if (!res.ok) {
            setError(data.error || 'Failed to create account');
            setLoading(false);
            return;
          }

          setShowOtpInput(true);
          setError('');
          startTimer();
          // toast.success('OTP sent to your email!'); // Toast not imported, skipping
        } catch (err) {
          setError('Something went wrong');
        }
      } else {
        // Step 2: Verify OTP
        try {
          const res = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
          });

          const data = await res.json();

          if (!res.ok) {
            setError(data.error || 'Invalid OTP');
            setLoading(false);
            return;
          }

          // Auto login after verification
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false
          });

          if (result?.error) {
            setError('Account verified! Please login.');
            setView('LOGIN');
          } else {
            router.push('/setup'); // Redirect to setup for new users
            router.refresh();
          }
        } catch (err) {
          setError('Verification failed');
        }
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to home - app/page.js will handle setup redirect if needed
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <>
      <CosmicBackground />

      {/* Floating Logo */}
      <Link href="/" className="fixed top-6 left-6 z-50">
        <Image
          src="/Text.png"
          alt="Sygil"
          width={100}
          height={32}
          className="h-8 w-auto"
          priority
        />
      </Link>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-12 py-20 lg:py-0 gap-8 lg:gap-16">
          {/* Left Side - Branding */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl lg:max-w-2xl">
            {/* Headline */}
            <h1 className="text-4xl sm:text-7xl lg:text-6xl font-bold gradient-text tracking-wide mb-4">
              Ask More From Your Favourite Creators !
            </h1>

            {/* Tagline */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-text mb-2">
              Be more than just a follower.
            </h2>
            <p className="text-text-muted text-sm sm:text-base mb-8">
              Unlock exclusive drops from your favourite creators.
            </p>

            {/* Illustration */}
            <div className="relative w-full max-w-lg lg:max-w-xl">
              <Image
                src="/Illustration.png"
                alt="Sygil Characters"
                width={600}
                height={400}
                sizes="(max-width: 768px) 100vw, 600px"
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div>

          {/* Right Side - Auth Card */}
          <div className="w-full max-w-sm lg:max-w-md">
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium mb-6"
              >
                <FaGoogle className="text-lg" />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-card-border"></div>
                <span className="text-text-muted text-sm">or</span>
                <div className="flex-1 h-px bg-card-border"></div>
              </div>

              {/* Auth Form */}
              <form onSubmit={view === 'FORGOT_PASSWORD' ? handleForgotPasswordSubmit : handleCredentialsAuth} className="space-y-4">

                <div>
                  <label className="block text-text text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="glass-input w-full px-4 py-3 rounded-lg text-text placeholder-text-muted"
                    required
                    disabled={view === 'FORGOT_PASSWORD' && forgotStep > 1}
                  />
                </div>

                {view === 'FORGOT_PASSWORD' && forgotStep === 3 && (
                  <div>
                    <label className="block text-text text-sm font-medium mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New Password"
                        className="glass-input w-full px-4 py-3 pr-12 rounded-lg text-text placeholder-text-muted"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors p-2"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                )}

                {view !== 'FORGOT_PASSWORD' && (
                  <div>
                    <label className="block text-text text-sm font-medium mb-2">{view === 'LOGIN' ? 'Password' : 'Set Password'}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={view === 'LOGIN' ? "Password" : "Set Password"}
                        className="glass-input w-full px-4 py-3 pr-12 rounded-lg text-text placeholder-text-muted"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors p-2"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                )}

                {((showOtpInput && view === 'SIGNUP') || (view === 'FORGOT_PASSWORD' && forgotStep >= 2)) && (
                  <div>
                    <label className="block text-text text-sm font-medium mb-2">Verification Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="glass-input w-full px-4 py-3 rounded-lg text-text placeholder-text-muted tracking-widest text-center font-mono text-lg"
                      required
                      maxLength={6}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-text-muted">
                        Check your email for the code
                      </p>
                      {timer > 0 ? (
                        <span className="text-xs text-text-muted">Resend in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
                      ) : (
                        <button type="button" onClick={handleResendOtp} className="text-xs text-primary hover:underline">
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-error text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gradient w-full py-3 rounded-lg text-white font-semibold disabled:opacity-50"
                >
                  {loading ? 'Please wait...' : (
                    view === 'LOGIN' ? 'Login' :
                      view === 'SIGNUP' ? (showOtpInput ? 'Verify & Signup' : 'Sign Up') :
                        (forgotStep === 1 ? 'Send Reset Code' : forgotStep === 2 ? 'Verify Code' : 'Reset Password')
                  )}
                </button>
              </form>

              {/* Forgot Password (only for login) */}
              {view === 'LOGIN' && (
                <div className="text-right mt-3">
                  <button onClick={() => {
                    setView('FORGOT_PASSWORD');
                    setForgotStep(1);
                    setError('');
                    setOtp('');
                    setPassword('');
                  }}
                    className="text-text-muted hover:text-text text-sm transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Back to Login from Forgot Password */}
              {view === 'FORGOT_PASSWORD' && (
                <div className="text-center mt-3">
                  <button onClick={() => setView('LOGIN')} className="text-text-muted hover:text-text text-sm transition-colors">
                    Back to Login
                  </button>
                </div>
              )}

              {/* Toggle Login/Signup */}
              {view !== 'FORGOT_PASSWORD' && (
                <p className="text-center mt-6 text-text">
                  {view === 'LOGIN' ? "New User? " : "Already have an account? "}
                  <button
                    onClick={() => {
                      setView(view === 'LOGIN' ? 'SIGNUP' : 'LOGIN');
                      setShowOtpInput(false);
                      setError('');
                      setOtp('');
                    }}
                    className="text-primary hover:text-primary-light font-semibold transition-colors"
                  >
                    {view === 'LOGIN' ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              )}

              {/* Creator Link */}
              <div className="text-center mt-6 pt-6 border-t border-card-border">
                <Link
                  href="/creators"
                  className="text-text-muted hover:text-primary text-sm transition-colors"
                >
                  Join as a creator →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
