"use client"
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { triggerProfileUpdate } from '@/utils/onboardingTriggers';
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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';

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
    instagram: { isVerified: false },
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
      instagram: {
        otp: u?.instagram?.otp ?? null,
        otpGeneratedAt: u?.instagram?.otpGeneratedAt ?? null,
        isVerified: u?.instagram?.isVerified ?? false,
      },
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
      router.push('/login');
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
    
    // Trigger onboarding progress update
    await triggerProfileUpdate();
    
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
    
    toast('Profile Updated', {
      position: "top-right",
      autoClose: 5000,
      theme: "light",
      transition: Bounce,
    });

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
          <p className="text-text">Loading</p>
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

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ top: 50 }}
      />

      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 pt-20">
        <div className="w-full max-w-lg space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-light text-primary mb-3">Account Settings</h1>
          </div>

          {/* Form Container */}
          <div className="bg-dropdown-hover rounded-lg p-6 space-y-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Name Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text/70">
                  Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name || ""}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`w-full px-3 py-3 rounded-lg bg-background text-text placeholder-background focus:outline-none transition-all duration-200 border-0 ${
                    formErrors.name ? 'ring-2 ring-error' : ''
                  }`}
                  required
                />
                {formErrors.name && (
                  <p className="text-error text-xs">Name is required</p>
                )}
              </div>

              {/* Email Field (Read-only) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text/70">Email</label>
                <input
                  type="email"
                  value={form.email || ""}
                  readOnly
                  disabled
                  className="w-full px-3 py-3 rounded-lg bg-background/30 text-text/50 placeholder-background cursor-not-allowed border-0"
                />
                <p className="text-text/50 text-xs">Email cannot be changed</p>
              </div>

              {/* Instagram Username */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text/70">
                  Username <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username || ""}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  disabled={form.instagram?.isVerified}
                  className={`w-full px-3 py-3 rounded-lg transition-all duration-200 border-0 ${
                    form.instagram?.isVerified
                      ? "bg-background/30 text-text/50 cursor-not-allowed"
                      : formErrors.username
                        ? "bg-background text-text placeholder-background focus:outline-none ring-2 ring-error"
                        : "bg-background text-text placeholder-background focus:outline-none"
                  }`}
                  required
                />
                {formErrors.username && (
                  <p className="text-error text-xs">Username is required</p>
                )}
                {form.instagram?.isVerified && (
                  <p className="text-accent text-xs">Username is locked after verification</p>
                )}
              </div>

              {/* Account Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text/70">Account Type</label>
                <select
                  name="accountType"
                  value={form.accountType || "User"}
                  onChange={handleChange}
                  className="w-full px-3 py-3 rounded-lg bg-background text-text focus:outline-none transition-all duration-200 border-0"
                >
                  <option value="User">User</option>
                  <option value="Creator">Creator</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;