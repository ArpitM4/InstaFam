"use client";
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useSession, signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

    if (res?.error) {
      setError(res.error.includes("verify") ? res.error : "Invalid email or password. Please try again.");
    } else if (res?.ok) {
      router.push("/account");
    } else {
      setError("Login failed. Please try again.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEmailLogin();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pb-8 pt-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-light text-primary mt-2 mb-3">Welcome back</h1>
          <p className="text-text/60">Sign in to your InstaFam account</p>
        </div>

        {/* Login Form */}
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
              <label className="block text-sm font-medium text-text/70 mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-3 rounded-lg bg-background/50 text-gray-600 placeholder-text/40 focus:outline-none focus:bg-background transition-all duration-200 border-0"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text/70 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-3 pr-12 rounded-lg bg-background/50 text-gray-600 placeholder-text/40 focus:outline-none focus:bg-background transition-all duration-200 border-0"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="text-right">
            <button
              onClick={() => router.push('/forgot-password')}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <button
            onClick={handleEmailLogin}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
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
            <span className="px-6 bg-background text-text/50">Or continue with</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => signIn("google", { callbackUrl: '/account' })}
            className="w-full flex items-center justify-center gap-3 bg-dropdown-hover hover:bg-text/10 text-text py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm"
          >
            <FaGoogle className="text-lg text-blue-500" />
            Continue with Google
          </button>
          
          <button
            onClick={() => signIn("github", { callbackUrl: '/account' })}
            className="w-full flex items-center justify-center gap-3 bg-dropdown-hover hover:bg-text/10 text-text py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm"
          >
            <FaGithub className="text-lg" />
            Continue with GitHub
          </button>
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-text/50">
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