"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import Footer from "@/components/Footer";

import CosmicBackground from "@/components/CosmicBackground";

export default function MarketingSplash() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);


  const handleCredentialsAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // Check if setup is needed by fetching user data
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        if (session?.user?.setupCompleted) {
          router.push('/');
        } else {
          router.push('/setup');
        }
        router.refresh();
      }
    } else {
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
            setIsLogin(true);
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
    signIn('google', { callbackUrl: '/setup' });
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
              Connect. Create. Ascend.
            </h2>
            <p className="text-text-muted text-sm sm:text-base mb-8">
              The Ultimate Fan & Creator Nexus.
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
              <form onSubmit={handleCredentialsAuth} className="space-y-4">


                <div>
                  <label className="block text-text text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="glass-input w-full px-4 py-3 rounded-lg text-text placeholder-text-muted"
                    required
                  />
                </div>

                <div>
                  <label className="block text-text text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
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

                {showOtpInput && !isLogin && (
                  <div>
                    <label className="block text-text text-sm font-medium mb-2">Verification Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="glass-input w-full px-4 py-3 rounded-lg text-text placeholder-text-muted tracking-widest text-center font-mono text-lg"
                      required={showOtpInput}
                      maxLength={6}
                    />
                    <p className="text-xs text-text-muted mt-2 text-center">
                      Check your email for the code
                    </p>
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
                  {loading ? 'Please wait...' : (isLogin ? 'Login' : (showOtpInput ? 'Verify & Signup' : 'Sign Up'))}
                </button>
              </form>

              {/* Forgot Password (only for login) */}
              {isLogin && (
                <div className="text-right mt-3">
                  <Link href="/forgot-password" className="text-text-muted hover:text-text text-sm transition-colors">
                    Forgot Password?
                  </Link>
                </div>
              )}

              {/* Toggle Login/Signup */}
              <p className="text-center mt-6 text-text">
                {isLogin ? "New User? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setShowOtpInput(false);
                    setError('');
                    setOtp('');
                  }}
                  className="text-primary hover:text-primary-light font-semibold transition-colors"
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </p>

              {/* Creator Link */}
              <div className="text-center mt-6 pt-6 border-t border-card-border">
                <Link
                  href="/creators"
                  className="text-text-muted hover:text-primary text-sm transition-colors"
                >
                  Are you a Creator? →
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
