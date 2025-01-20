"use client";
import { useState } from "react";

const Dashboard = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [coverPic, setCoverPic] = useState(null);

  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
  };

  const handleCoverPicUpload = (e) => {
    const file = e.target.files[0];
    setCoverPic(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Save button clicked");
    // Handle form submission logic here
  };

  return (
    <div className="min-h-screen  bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-opacity-70 backdrop-blur-lg flex flex-col items-center py-12 px-6">
      {/* Page Heading */}
      <h1 className="text-4xl mt-10 font-bold text-white mb-8">Your Dashboard</h1>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
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
            placeholder="Enter your name"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Username Input */}
        <div>
          <label
            htmlFor="username"
            className="block text-gray-700 font-medium mb-1"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            placeholder="Choose a username"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Profile Picture Upload */}
        <div>
          <label
            htmlFor="profile-pic"
            className="block text-gray-700 font-medium mb-1"
          >
            Profile Picture
          </label>
          <input
            type="file"
            id="profile-pic"
            onChange={handleProfilePicUpload}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {profilePic && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {profilePic.name}
            </p>
          )}
        </div>

        {/* Cover Picture Upload */}
        <div>
          <label
            htmlFor="cover-pic"
            className="block text-gray-700 font-medium mb-1"
          >
            Cover Picture
          </label>
          <input
            type="file"
            id="cover-pic"
            onChange={handleCoverPicUpload}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {coverPic && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {coverPic.name}
            </p>
          )}
        </div>

        {/* Razorpay Credential */}
        <div>
          <label
            htmlFor="razorpay"
            className="block text-gray-700 font-medium mb-1"
          >
            Razorpay ID
          </label>
          <input
            type="text"
            id="razorpay"
            placeholder="Enter Razorpay ID"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="razorpay"
            className="block text-gray-700 font-medium mb-1"
          >
            Razorpay Secret
          </label>
          <input
            type="text"
            id="razorpay"
            placeholder="Enter Razorpay Secret"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

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
  );
};

export default Dashboard;
