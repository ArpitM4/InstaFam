"use client"
import React, { useEffect, useState } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import "../app/globals.css";
import { useRouter } from 'next/navigation'
import { fetchuser, updateProfile } from '@/actions/useractions'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';

const Dashboard = () => {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [form, setform] = useState({})

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
      let u = await fetchuser(session.user.name)
      setform(u)
  }

  const handleChange = (e) => {
      setform({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {

      let a = await updateProfile(e, session.user.name)
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

  return (
      <>
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
    <div className="min-h-screen  bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-opacity-70 backdrop-blur-lg flex flex-col items-center py-12 px-6">
      {/* Page Heading */}
      <h1 className="text-4xl mt-10 font-bold text-white mb-8">Your Dashboard</h1>

      {/* Form Container */}
      <form
  action={handleSubmit}
  className="w-full max-w-lg bg-white bg-opacity-90 rounded-lg shadow-md p-6 space-y-6"
>
  {/* Name Input */}
  <div>
    <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
      Name
    </label>
    <input
      type="text"
      id="name"
      name="name"
      value={form.name || ""}
      onChange={handleChange}
      placeholder="Enter your name"
      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>

  {/* Email Input */}
  <div>
    <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
      Email
    </label>
    <input
      type="email"
      id="email"
      name="email"
      value={form.email || ""}
      onChange={handleChange}
      placeholder="Enter your email"
      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>

  {/* Username Input */}
  <div>
    <label htmlFor="username" className="block text-gray-700 font-medium mb-1">
      Username
    </label>
    <input
      type="text"
      id="username"
      name="username"
      value={form.username || ""}
      onChange={handleChange}
      placeholder="Choose a username"
      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>

  {/* Profile Picture Input */}
  <div>
    <label htmlFor="profilepic" className="block text-gray-700 font-medium mb-1">
      Profile Picture
    </label>
    <input
      type="text"
      id="profilepic"
      name="profilepic"
      value={form.profilepic || ""}
      onChange={handleChange}
      placeholder="Enter profile picture URL"
      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>

  {/* Cover Picture Input */}
  <div>
    <label htmlFor="coverpic" className="block text-gray-700 font-medium mb-1">
      Cover Picture
    </label>
    <input
      type="text"
      id="coverpic"
      name="coverpic"
      value={form.coverpic || ""}
      onChange={handleChange}
      placeholder="Enter cover picture URL"
      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>

  {/* Razorpay Credentials */}
  {/* <div>
    <label htmlFor="razorpayid" className="block text-gray-700 font-medium mb-1">
      Razorpay ID
    </label>
    <input
      type="text"
      id="razorpayid"
      name="razorpayid"
      value={form.razorpayid || ""}
      onChange={handleChange}
      placeholder="Enter Razorpay ID"
      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div>

  <div>
    <label htmlFor="razorpaysecret" className="block text-gray-700 font-medium mb-1">
      Razorpay Secret
    </label>
    <input
      type="text"
      id="razorpaysecret"
      name="razorpaysecret"
      value={form.razorpaysecret || ""}
      onChange={handleChange}
      placeholder="Enter Razorpay Secret"
      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
    />
  </div> */}

  {/* Save Button */}
  <div>
    <button
      type="submit"
      className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition"
    >
      Save
    </button>
  </div>
</form>

    </div>
    </>
  );
};

export default Dashboard;
