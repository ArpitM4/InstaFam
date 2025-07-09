"use client"
import React, { useEffect, useState } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import "../app/globals.css";
import { useRouter } from 'next/navigation'
import { fetchuser, updateProfile } from '@/actions/useractions'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';

const Account = () => {
  const { data: session, update } = useSession()
  const router = useRouter()
  // const [form, setform] = useState({})
const [form, setForm] = useState({
  name: "",
  email: "",
  username: "",
  profilepic: "",
  coverpic: "",
  accountType: "User",
  instagram: { isVerified: false },
});


  useEffect(() => {
      // console.log(session)

      if (!session) {
          router.push('/login')
      }
      else {
          getData()
      }
  }, [])

 const getData = async () => {
  const u = await fetchuser(session.user.name);
  // Guarantee instagram key always exists:
  setForm({
    ...u,
    instagram: {
      otp: u.instagram?.otp ?? null,
      otpGeneratedAt: u.instagram?.otpGeneratedAt ?? null,
      isVerified: u.instagram?.isVerified ?? false
    }
  });
};

  

  const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {

      let a = await updateProfile(e, session.user.name)
      await update();
      toast('Profile Updated', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
          });
  }

  
  if (!form) return(<div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-pink-500 border-t-transparent mb-4"></div>
        <p className="text-lg font-semibold">Loading InstaFam...</p>
      </div>
    </div>)
    
  return (
      <>

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
    <div id="stardiv" className="min-h-screen flex pt-24 flex-col items-center py-16 px-4 bg-black text-white">
  {/* Page Heading */}
  <h1 className="text-4xl font-bold mb-10 text-[#ffffff]">Account Settings</h1>

  {/* Form Container */}
  <form
    action={handleSubmit}
    className="w-full max-w-xl bg-white/10 border border-white/20 rounded-xl shadow-md p-8 space-y-6 backdrop-blur-md"
  >
    {/* Name */}
    <div>
      <label htmlFor="name" className="block text-sm font-semibold text-white mb-1">Name</label>
      <input
        type="text"
        id="name"
        name="name"
        value={form.name || ""}
        onChange={handleChange}
        placeholder="Enter your name"
        className="w-full px-4 py-2 rounded bg-black text-white border border-white/20 focus:ring-2 focus:ring-[#fb0582] outline-none"
      />
    </div>

    {/* Email */}
    <div>
      <label htmlFor="email" className="block text-sm font-semibold text-white mb-1">Email</label>
      <input
        type="email"
        id="email"
        name="email"
        value={form.email || ""}
        onChange={handleChange}
        placeholder="Enter your email"
        className="w-full px-4 py-2 rounded bg-black text-white border border-white/20 focus:ring-2 focus:ring-[#fb0582] outline-none"
      />
    </div>

    {/* Instagram Username */}
    <div>
      <label htmlFor="username" className="block text-sm font-semibold text-white mb-1">Instagram Username</label>
      <input
        type="text"
        id="username"
        name="username"
        value={form.username || ""}
        onChange={handleChange}
        placeholder="Choose a username"
        disabled={form.instagram?.isVerified}
        className={`w-full px-4 py-2 rounded border focus:ring-2 focus:ring-[#fb0582] outline-none ${
          form.instagram?.isVerified
            ? "bg-gray-800 text-gray-400 border-white/20 cursor-not-allowed"
            : "bg-black text-white border-white/20"
        }`}
      />
      {form.instagram?.isVerified && (
        <p className="mt-1 text-sm text-yellow-300">Your username is locked after verification.</p>
      )}
    </div>

    {/* Profile Picture */}
    <div>
      <label htmlFor="profilepic" className="block text-sm font-semibold text-white mb-1">Profile Picture URL</label>
      <input
        type="text"
        id="profilepic"
        name="profilepic"
        value={form.profilepic || ""}
        onChange={handleChange}
        placeholder="Paste your profile pic URL"
        className="w-full px-4 py-2 rounded bg-black text-white border border-white/20 focus:ring-2 focus:ring-[#fb0582] outline-none"
      />
    </div>

    {/* Cover Picture */}
    <div>
      <label htmlFor="coverpic" className="block text-sm font-semibold text-white mb-1">Cover Picture URL</label>
      <input
        type="text"
        id="coverpic"
        name="coverpic"
        value={form.coverpic || ""}
        onChange={handleChange}
        placeholder="Paste your cover pic URL"
        className="w-full px-4 py-2 rounded bg-black text-white border border-white/20 focus:ring-2 focus:ring-[#fb0582] outline-none"
      />
    </div>

    {/* Account Type */}
    <div>
      <label htmlFor="accountType" className="block text-sm font-semibold text-white mb-1">Account Type</label>
      <select
        id="accountType"
        name="accountType"
        value={form.accountType || "User"}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded bg-black text-white border border-white/20 focus:ring-2 focus:ring-[#fb0582] outline-none"
      >
        <option value="User">User</option>
        <option value="Creator">Creator</option>
      </select>
    </div>

    {/* Submit */}
    <div>
      <button
        type="submit"
        className="w-full bg-[#fb0582] hover:bg-[#e50475] transition text-white font-semibold py-2 rounded-md"
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