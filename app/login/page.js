"use client";
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useSession, signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Login = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) {
      router.push('/account');
    }
  }, [session, router]);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEmailLogin();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Welcome back</h1>
          <p className="text-text/70">Sign in to your InstaFam account</p>
        </div>

        {/* Login Form */}
        <div className="bg-text/5 border border-text/10 rounded-lg p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text/70 mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 rounded-lg bg-background border border-text/10 text-text placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text/70 mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 rounded-lg bg-background border border-text/10 text-text placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <button
            onClick={handleEmailLogin}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-text/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-text/60">Or continue with</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => signIn("google", { callbackUrl: '/account' })}
            className="w-full flex items-center justify-center gap-3 bg-background border border-text/10 hover:bg-text/5 text-text py-3 px-4 rounded-lg font-medium transition-colors"
          >
            <FaGoogle className="text-lg text-red-500" />
            Continue with Google
          </button>
          
          <button
            onClick={() => signIn("github", { callbackUrl: '/account' })}
            className="w-full flex items-center justify-center gap-3 bg-background border border-text/10 hover:bg-text/5 text-text py-3 px-4 rounded-lg font-medium transition-colors"
          >
            <FaGithub className="text-lg" />
            Continue with GitHub
          </button>
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-text/60">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>

  );
};

export default Login;