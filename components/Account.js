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
                <h2 className="text-base font-medium text-white truncate">{form.name || 'Your Name'}</h2>
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
