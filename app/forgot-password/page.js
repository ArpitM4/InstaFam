"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("email"); // "email" or "otp"
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStep("otp");
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP verified! Please enter your new password.");
        setStep("password");
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pb-8 pt-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-light text-primary mt-2 mb-3">
            {step === "email" && "Reset Password"}
            {step === "otp" && "Enter OTP"}
            {step === "password" && "New Password"}
          </h1>
          <p className="text-text/60">
            {step === "email" && "Enter your email to receive a reset code"}
            {step === "otp" && "Enter the 6-digit code sent to your email"}
            {step === "password" && "Create your new password"}
          </p>
        </div>

        {/* Form */}
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

          {message && (
            <div className="bg-green-500/10 rounded-lg p-3">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-400 text-sm">{message}</p>
              </div>
            </div>
          )}

          {step === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyPress={e => handleKeyPress(e, handleSendOTP)}
                  className="w-full px-3 py-3 rounded-lg bg-background/50 text-gray-600 placeholder-text/40 focus:outline-none focus:bg-background transition-all duration-200 border-0"
                  required
                />
              </div>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">Verification Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={e => handleKeyPress(e, handleVerifyOTP)}
                  className="w-full px-3 py-3 rounded-lg bg-background/50 text-gray-600 placeholder-text/40 focus:outline-none focus:bg-background transition-all duration-200 border-0 text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              <button
                onClick={() => setStep("email")}
                className="w-full text-primary hover:text-primary/80 transition-colors text-sm"
              >
                Send new code
              </button>
            </div>
          )}

          {step === "password" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-3 pr-12 rounded-lg bg-background/50 text-gray-600 placeholder-text/40 focus:outline-none focus:bg-background transition-all duration-200 border-0"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyPress={e => handleKeyPress(e, handleResetPassword)}
                    className="w-full px-3 py-3 pr-12 rounded-lg bg-background/50 text-gray-600 placeholder-text/40 focus:outline-none focus:bg-background transition-all duration-200 border-0"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          )}
        </div>

        {/* Back to login */}
        <div className="text-center">
          <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
