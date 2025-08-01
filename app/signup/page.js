"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !username || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error && data.error.includes("Username already taken")) {
        setError("Username already taken by a verified user");
      } else if (data.error && data.error.includes("E11000")) {
        setError("Email already exists. Please use a different email.");
      } else {
        setError(data.error || "Signup failed. Please try again.");
      }
    } else {
      router.push("/login"); // redirect to login after successful signup
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Create account</h1>
          <p className="text-text/70">Join the InstaFam community</p>
        </div>

        {/* Signup Form */}
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
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 rounded-lg bg-background border border-text/10 text-text placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text/70 mb-2">Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 rounded-lg bg-background border border-text/10 text-text placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                required
              />
              <p className="text-xs text-text/50 mt-1">Choose a unique username for your profile</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text/70 mb-2">Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 rounded-lg bg-background border border-text/10 text-text placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                required
              />
              <p className="text-xs text-text/50 mt-1">Password must be at least 6 characters long</p>
            </div>
          </div>

          <button
            onClick={handleSignup}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            Create Account
          </button>
        </div>

        {/* Sign in link */}
        <div className="text-center">
          <p className="text-text/60">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>

  );
};

export default Signup;
