"use client"
import React, { useEffect, useState, useCallback, useRef } from 'react'
// Simple modal component for username
function UsernameModal({ open, onSubmit, loading, error }) {
  const [username, setUsername] = useState("");
  useEffect(() => { if (!open) setUsername(""); }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-background p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-center">Choose a Username</h2>
        <input
          type="text"
          className="w-full px-4 py-2 rounded border border-primary focus:ring-2 focus:ring-primary outline-none mb-2 text-white bg-background"
          placeholder="Enter a username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={loading}
        />
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <button
          className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-2 rounded disabled:opacity-60"
          onClick={() => onSubmit(username)}
          disabled={loading || !username.trim()}
        >
          {loading ? "Checking..." : "Save Username"}
        </button>
      </div>
    </div>
  );
}

// Simple modal component for name
function NameModal({ open, onSubmit, loading, error }) {
  const [name, setName] = useState("");
  useEffect(() => { if (!open) setName(""); }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-background p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-center">Enter Your Name</h2>
        <input
          type="text"
          className="w-full px-4 py-2 rounded border border-primary focus:ring-2 focus:ring-primary outline-none mb-2 text-white bg-background"
          placeholder="Enter your name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
        />
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <button
          className="w-full bg-primary hover:bg-primary/80 text-white font-semibold py-2 rounded disabled:opacity-60"
          onClick={() => onSubmit(name)}
          disabled={loading || !name.trim()}
        >
          {loading ? "Checking..." : "Save Name"}
        </button>
      </div>
    </div>
  );
}
import { useSession, signIn, signOut } from "next-auth/react"
import "../app/globals.css";
import { useRouter } from 'next/navigation'
import { fetchuser, updateProfile } from '@/actions/useractions'
import { useUser } from '@/context/UserContext'
import { emitProfileUpdate, emitAccountTypeChange } from '@/utils/eventBus'
import { toast } from 'sonner';

const Account = () => {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const { refreshUserData, updateUserData } = useUser(); // For updating user data in navbar

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    profilepic: "",
    coverpic: "",
    accountType: "User",

  });

  const [loading, setLoading] = useState(true);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [nameModalError, setNameModalError] = useState("");
  const [nameModalLoading, setNameModalLoading] = useState(false);
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
    // Only show modal on first load
    if (!u || !u.username || u.username.trim() === "") {
      setShowUsernameModal(true);
      setShowNameModal(false);
    } else if (!u.name || u.name.trim() === "") {
      setShowUsernameModal(false);
      setShowNameModal(true);
    } else {
      setShowUsernameModal(false);
      setShowNameModal(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
    } else if (status === "authenticated" && session && !hasLoadedData.current) {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, getData]);

  // Modal username submit handler
  const handleUsernameModal = async (username) => {
    if (!username || username.trim() === "") {
      setModalError("Username cannot be empty.");
      toast.error("Username cannot be empty!", { position: "top-right", autoClose: 3000 });
      return;
    }
    setModalLoading(true);
    setModalError("");
    // Try to update profile with new username
    const res = await updateProfile({ ...form, username }, form.username);
    if (res?.error) {
      setModalError(res.error);
      setModalLoading(false);
    } else {
      setForm(f => ({ ...f, username }));
      setModalLoading(false);
      setShowUsernameModal(false);
      setShowNameModal(true); // Open name modal after username
      toast.success("Username set successfully!", { position: "top-right", autoClose: 3000 });
      if (typeof update === 'function') await update();

      // Emit global profile update event
      emitProfileUpdate({ username });

      // Update user data in navbar/context (legacy support)
      if (refreshUserData) {
        refreshUserData(true);
      }
      if (updateUserData) {
        updateUserData({ username });
      }
    }
  };

  // Modal name submit handler
  const handleNameModal = async (name) => {
    if (!name || name.trim() === "") {
      setNameModalError("Name cannot be empty.");
      toast.error("Name cannot be empty!", { position: "top-right", autoClose: 3000 });
      return;
    }
    setNameModalLoading(true);
    setNameModalError("");
    const res = await updateProfile({ ...form, name }, form.username);
    if (res?.error) {
      setNameModalError(res.error);
      setNameModalLoading(false);
    } else {
      setForm(f => ({ ...f, name }));
      setNameModalLoading(false);
      setShowNameModal(false);
      toast.success("Name set successfully!", { position: "top-right", autoClose: 3000 });
      if (typeof update === 'function') await update();

      // Emit global profile update event
      emitProfileUpdate({ name });

      // Update user data in navbar/context (legacy support)
      if (refreshUserData) {
        refreshUserData(true);
      }
      if (updateUserData) {
        updateUserData({ name });
      }
    }
  };

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
      <UsernameModal
        open={showUsernameModal}
        onSubmit={handleUsernameModal}
        loading={modalLoading}
        error={modalError}
      />
      <NameModal
        open={showNameModal}
        onSubmit={handleNameModal}
        loading={nameModalLoading}
        error={nameModalError}
      />



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
              {form.profilepic ? (
                <img
                  src={form.profilepic}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="text-lg font-bold text-white/50">
                    {(form.name || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
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
                <label className="block text-xs font-medium text-white/70 mb-2">Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Only allow switching to User if not already a Creator
                      if (form.accountType !== 'Creator') {
                        setForm(prev => ({ ...prev, accountType: 'User' }));
                      }
                    }}
                    disabled={form.accountType === 'Creator'}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${form.accountType === 'User'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                      : form.accountType === 'Creator'
                        ? 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                        : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                      }`}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, accountType: 'Creator' }))}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${form.accountType === 'Creator'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                      : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                      }`}
                  >
                    Creator
                  </button>
                </div>
                {form.accountType === 'Creator' && (
                  <p className="text-white/40 text-xs mt-2">Creator accounts cannot be changed back to User</p>
                )}
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
