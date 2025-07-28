"use client"
import React, { useEffect, useState } from 'react'
// Simple modal component
function UsernameModal({ open, onSubmit, loading, error }) {
  const [username, setUsername] = useState("");
  useEffect(() => { if (!open) setUsername(""); }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-background p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 text-center">Choose a Username</h2>
        <input
          type="text"
          className="w-full px-4 py-2 rounded border border-primary focus:ring-2 focus:ring-primary outline-none mb-2"
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
import { useSession, signIn, signOut } from "next-auth/react"
import "../app/globals.css";
import { useRouter } from 'next/navigation'
import { fetchuser, updateProfile } from '@/actions/useractions'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';

const Account = () => {
  const { data: session, update } = useSession();
  const router = useRouter();

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
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/login');
    } else {
      getData();
    }
  }, [session]);

  const getData = async () => {
    const u = await fetchuser(session.user.name);
    setForm({
      ...u,
      instagram: {
        otp: u && u.instagram ? u.instagram.otp ?? null : null,
        otpGeneratedAt: u && u.instagram ? u.instagram.otpGeneratedAt ?? null : null,
        isVerified: u && u.instagram ? u.instagram.isVerified ?? false : false,
      },
    });
    setLoading(false);
    // Show modal only if username is missing/empty (first login or never set)
    if (!u.username || u.username.trim() === "") {
      setShowUsernameModal(true);
    }
  };
  // Modal username submit handler
  const handleUsernameModal = async (username) => {
    setModalLoading(true);
    setModalError("");
    // Try to update profile with new username
    const res = await updateProfile({ ...form, username }, form.username);
    if (res?.error) {
      setModalError(res.error);
      setModalLoading(false);
    } else {
      setShowUsernameModal(false);
      setModalLoading(false);
      setForm(f => ({ ...f, username }));
      toast.success("Username set successfully!", { position: "top-right", autoClose: 3000 });
      await getData(); // Refresh user data
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    let a = await updateProfile(e, session.user.name);
    await update();
    toast('Profile Updated', {
      position: "top-right",
      autoClose: 5000,
      theme: "light",
      transition: Bounce,
    });
  };

  // ✅ Loading screen if still fetching data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-lg font-semibold">Loading InstaFam...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <UsernameModal
        open={showUsernameModal}
        onSubmit={handleUsernameModal}
        loading={modalLoading}
        error={modalError}
      />

              <div id="stars3"></div>
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
          />
    <div
      id="stardiv"
      className="min-h-screen flex pt-24 flex-col items-center py-16 px-4 bg-background text-text"
    >
  {/* Page Heading */}
  <h1 className="text-4xl font-bold mb-10 text-text">Account Settings</h1>

  {/* Form Container */}
  <form
    action={handleSubmit}
    className="w-full max-w-xl bg-secondary/10 border border-secondary/20 rounded-xl shadow-md p-8 space-y-6 backdrop-blur-md"
  >
    {/* Name */}
    <div>
      <label htmlFor="name" className="block text-sm font-semibold text-text mb-1">Name</label>
      <input
        type="text"
        id="name"
        name="name"
        value={form.name || ""}
        onChange={handleChange}
        placeholder="Enter your name"
        className="w-full px-4 py-2 rounded bg-background text-text border border-secondary/30 focus:ring-2 focus:ring-primary outline-none"
      />
    </div>

    {/* Email */}
    <div>
      <label htmlFor="email" className="block text-sm font-semibold text-text mb-1">Email</label>
      <input
        type="email"
        id="email"
        name="email"
        value={form.email || ""}
        onChange={handleChange}
        placeholder="Enter your email"
        className="w-full px-4 py-2 rounded bg-background text-text border border-secondary/30 focus:ring-2 focus:ring-primary outline-none"
      />
    </div>

    {/* Instagram Username */}
    <div>
      <label htmlFor="username" className="block text-sm font-semibold text-text mb-1">Instagram Username</label>
      <input
        type="text"
        id="username"
        name="username"
        value={form.username || ""}
        onChange={handleChange}
        placeholder="Choose a username"
        disabled={form.instagram?.isVerified}
        className={`w-full px-4 py-2 rounded border focus:ring-2 focus:ring-primary outline-none ${
          form.instagram?.isVerified
            ? "bg-secondary/30 text-text/40 border-secondary/30 cursor-not-allowed"
            : "bg-background text-text border-secondary/30"
        }`}
      />
      {form.instagram?.isVerified && (
        <p className="mt-1 text-sm text-accent">Your username is locked after verification.</p>
      )}
    </div>

    {/* Profile Picture */}
    <div>
      <label htmlFor="profilepic" className="block text-sm font-semibold text-text mb-1">Profile Picture URL</label>
      <input
        type="text"
        id="profilepic"
        name="profilepic"
        value={form.profilepic || ""}
        onChange={handleChange}
        placeholder="Paste your profile pic URL"
        className="w-full px-4 py-2 rounded bg-background text-text border border-secondary/30 focus:ring-2 focus:ring-primary outline-none"
      />
    </div>

    {/* Cover Picture */}
    <div>
      <label htmlFor="coverpic" className="block text-sm font-semibold text-text mb-1">Cover Picture URL</label>
      <input
        type="text"
        id="coverpic"
        name="coverpic"
        value={form.coverpic || ""}
        onChange={handleChange}
        placeholder="Paste your cover pic URL"
        className="w-full px-4 py-2 rounded bg-background text-text border border-secondary/30 focus:ring-2 focus:ring-primary outline-none"
      />
    </div>

    {/* Account Type */}
    <div>
      <label htmlFor="accountType" className="block text-sm font-semibold text-text mb-1">Account Type</label>
      <select
        id="accountType"
        name="accountType"
        value={form.accountType || "User"}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded bg-background text-text border border-secondary/30 focus:ring-2 focus:ring-primary outline-none"
      >
        <option value="User">User</option>
        <option value="Creator">Creator</option>
      </select>
    </div>

    {/* Submit */}
    <div>
      <button
        type="submit"
        className="w-full bg-primary hover:bg-primary/80 transition text-text font-semibold py-2 rounded-md"
      >
        Save Changes
      </button>
    </div>
  </form>
</div>

    </>
  );
};

export default Account;