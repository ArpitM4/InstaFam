"use client"
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { FaPen } from 'react-icons/fa';
import Image from "next/image";

import { useSession, signIn, signOut } from "next-auth/react"
import "../app/globals.css";
import { useRouter } from 'next/navigation'
import { fetchuser, updateProfile } from '@/actions/useractions'
import { useUser } from '@/context/UserContext'
import { emitProfileUpdate, emitAccountTypeChange } from '@/utils/eventBus'
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const Account = ({ initialUser }) => {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const { refreshUserData, updateUserData } = useUser(); // For updating user data in navbar

  const [form, setForm] = useState({
    name: initialUser?.name || "",
    email: initialUser?.email || "",
    username: initialUser?.username || "",
    profilepic: initialUser?.profilepic || "",
    coverpic: initialUser?.coverpic || "",
    accountType: initialUser?.accountType || "User",
    isVerified: initialUser?.isVerified || false,
    followersCount: initialUser?.followersArray?.length || initialUser?.followers || 0
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "profilepic");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const uploadedUrl = data.url || data.secure_url;

      if (data.success && uploadedUrl) {
        setForm(prev => ({ ...prev, profilepic: uploadedUrl }));
        toast.success("Profile picture updated!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // If we have initialUser, we are not loading
  const [loading, setLoading] = useState(!initialUser);

  const hasLoadedData = useRef(false);

  // Only show modal on first load if username is blank
  const getData = useCallback(async () => {
    if (!session?.user?.email) return;
    const u = await fetchuser(session.user.email);

    // Extract only the fields we need to avoid circular references
    setForm({
      name: u?.name || "",
      email: u?.email || "",
      username: u?.username || "",
      profilepic: u?.profilepic || "",
      coverpic: u?.coverpic || "",
      accountType: u?.accountType || "User",
      isVerified: u?.isVerified || false,
      followersCount: u?.followersArray?.length || u?.followers || 0
    });
    setLoading(false);
    hasLoadedData.current = true;
  }, [session?.user?.email]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
    } else if (status === "authenticated" && session && !hasLoadedData.current && !initialUser) {
      // Only fetch if we don't have initialUser
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, getData, initialUser]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  // Validation state for form fields
  const [formErrors, setFormErrors] = useState({ name: false, username: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields
    const errors = {
      name: !(form.name || "").trim(),
      username: !(form.username || "").trim(),
    };
    setFormErrors(errors);
    if (errors.name && errors.username) {
      toast.error("Name and Username are mandatory.", { position: "top-right", autoClose: 3000 });
      return;
    } else if (errors.name) {
      toast.error("Name is mandatory.", { position: "top-right", autoClose: 3000 });
      return;
    } else if (errors.username) {
      toast.error("Username is mandatory.", { position: "top-right", autoClose: 3000 });
      return;
    }

    // Get current user data to compare account type changes
    const currentUser = await fetchuser(session.user.email);
    const isChangingToCreator = currentUser?.accountType === "User" && form.accountType === "Creator";

    let a = await updateProfile(form, session.user.name);
    await update();

    // Emit global profile update event (only pass necessary fields)
    emitProfileUpdate({
      name: form.name,
      username: form.username,
      accountType: form.accountType,
      profilepic: form.profilepic,
      coverpic: form.coverpic
    });

    // Update user data in navbar/context (legacy support)
    if (refreshUserData) {
      refreshUserData(true); // Force refresh
    }
    if (updateUserData) {
      updateUserData({
        name: form.name,
        username: form.username,
        accountType: form.accountType,
        profilepic: form.profilepic,
        coverpic: form.coverpic
      });
    }

    // If account type changed, emit specific event
    if (form.accountType && form.accountType !== currentUser?.accountType) {
      emitAccountTypeChange(form.accountType);
    }

    toast.success('Profile Updated');

    // Redirect to dashboard if user changed from User to Creator
    if (isChangingToCreator) {
      setTimeout(() => {
        router.push('/creator/dashboard');
      }, 1500); // Delay to show the success toast
    }
  };

  const handleRedeemBadge = async () => {
    try {
      const res = await fetch('/api/user/verify', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        setForm(prev => ({ ...prev, isVerified: true }));
        toast.success("Congratulations! You are now verified!");
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00E5D4', '#FF2F72', '#FFD700']
        });
        // Force refresh context
        if (refreshUserData) refreshUserData(true);
      } else {
        toast.error(data.error || "Failed to redeem badge");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Something went wrong");
    }
  };

  // Simple minimal loading screen
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent mb-4 mx-auto"></div>
          <p className="text-white/60">Loading your account...</p>
        </div>
      </div>
    );
  }

  // If unauthenticated, redirect (this happens immediately with new status check)
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <>




      <div className="min-h-screen">
        <div className="max-w-md mx-auto">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-white">Account Settings</h1>
            <p className="text-sm text-white/50">Manage your profile</p>
          </div>

          {/* Profile Preview Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative group cursor-pointer">
                <label className="cursor-pointer block relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />

                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-white/20">
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      </div>
                    )}

                    {form.profilepic ? (
                      <img
                        src={form.profilepic}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white/50">
                          {(form.name || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <FaPen className="text-white text-sm" />
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-base font-medium text-white truncate flex items-center gap-1.5">
                  {form.name || 'Your Name'}
                  {form.isVerified && (
                    <span className="text-blue-400 text-sm" title="Verified Creator">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    </span>
                  )}
                </h2>
                <p className="text-sm text-white/50">@{form.username || 'username'}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${form.accountType === 'Creator'
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-blue-500/20 text-blue-400'
                }`}>
                {form.accountType || 'User'}
              </span>
            </div>
          </div>

          {/* Verified Badge Section - Only for Creators and NOT verified */}
          {form.accountType === 'Creator' && !form.isVerified && (
            <div className="bg-gradient-to-br from-[#00E5D4]/10 to-[#1d4ed8]/10 border border-white/10 rounded-xl p-5 mb-4 relative overflow-hidden group">
              {/* Background Glow Effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5D4]/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Get Verified Badge
                    <span className="text-blue-400 text-xl">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    </span>
                  </h3>
                  <p className="text-sm text-white/60">Adds credibility to your profile</p>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-white/40 line-through">₹ 5,000</span>
                  <span className="block text-xl font-bold text-[#00E5D4]">FREE</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-white/70 mb-2">
                  <span>Progress</span>
                  <span>{Math.min(form.followersCount, 3)} / 3 Followers</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 mb-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#00E5D4] to-[#1d4ed8] h-2.5 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${Math.min((form.followersCount / 3) * 100, 100)}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-white/30 skew-x-12 animate-[shimmer_2s_infinite] w-full transform -translate-x-full"></div>
                  </div>
                </div>

                <button
                  onClick={handleRedeemBadge}
                  disabled={form.followersCount < 3}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${form.followersCount >= 3
                    ? 'bg-gradient-to-r from-[#00E5D4] to-[#1d4ed8] text-black shadow-lg shadow-cyan-500/20 hover:scale-[1.02]'
                    : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                    }`}
                >
                  {form.followersCount >= 3 ? (
                    <>
                      Redeem Badge Now 🌟
                    </>
                  ) : (
                    <>
                      Needs {3 - form.followersCount} more followers
                    </>
                  )}
                </button>
                <p className="text-[10px] text-white/30 text-center mt-2">
                  Limited time offer for early creators
                </p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="p-4 border-b border-white/10">
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name || ""}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`w-full px-3 py-2 text-sm rounded-lg bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all border ${formErrors.name ? 'border-rose-500' : 'border-white/10 hover:border-white/20'
                    }`}
                  required
                />
                {formErrors.name && (
                  <p className="text-rose-400 text-xs mt-1">Name is required</p>
                )}
              </div>

              {/* Username Field */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-white/70">
                    Username <span className="text-rose-400">*</span>
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">@</span>
                  <input
                    type="text"
                    name="username"
                    value={form.username || ""}
                    onChange={handleChange}
                    placeholder="username"
                    className={`w-full pl-7 pr-3 py-2 text-sm rounded-lg transition-all border ${formErrors.username
                      ? "bg-white/5 text-white placeholder-white/30 focus:outline-none border-rose-500"
                      : "bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-primary/50 border-white/10 hover:border-white/20"
                      }`}
                    required
                  />
                </div>
                {formErrors.username && (
                  <p className="text-rose-400 text-xs mt-1">Username is required</p>
                )}
              </div>

              {/* Email Field (Read-only) */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-white/70">Email</label>
                  <span className="text-white/40 text-xs">Read-only</span>
                </div>
                <input
                  type="email"
                  value={form.email || ""}
                  readOnly
                  disabled
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 text-white/50 cursor-not-allowed border border-white/5"
                />
              </div>

              {/* Account Type */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/70">Account Type</label>
                  <span className="text-white/40 text-xs">Display only</span>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${form.accountType === 'Creator'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                    {form.accountType || 'User'}
                  </span>
                </div>
                <p className="text-white/40 text-xs mt-2">Account type is managed automatically based on your page visibility.</p>
              </div>

              {/* Submit Button */}
              <div className="p-4">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Creator Promo (Only for non-creators) */}
          {form.accountType !== 'Creator' && (
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 rounded-xl p-5 mt-4 text-center">
              <h3 className="text-lg font-bold text-white mb-2">Become a Creator</h3>
              <p className="text-sm text-white/60 mb-4">Start your journey and earn from your passion.</p>

              <a
                href={`/${form.username}`}
                className="block w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg text-sm font-medium transition-all mb-3"
              >
                Visit Your Page
              </a>

              <a
                href="/creators"
                className="text-xs text-primary hover:text-primary-light transition-colors flex items-center justify-center gap-1"
              >
                Learn more about being a creator
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          )}



          {/* Logout Button */}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full mt-4 flex items-center justify-center gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 py-3 rounded-xl transition-all text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Account;
