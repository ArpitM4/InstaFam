"use client";

import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function unverified() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center px-6">
      <h1 className="text-6xl font-bold mb-4 text-yellow-400">Hold Up!</h1>
      <h2 className="text-2xl font-semibold mb-2">Verification Required</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        You need to verify your Instagram account to access this page. Head to your dashboard to complete the verification process.
      </p>
      <Link
        href="/account"
        className="flex items-center text-white px-4 py-2 bg-pink-600 rounded hover:bg-pink-700 transition"
      >
        <FaArrowLeft className="mr-2" /> Go to Account Settings
      </Link>
    </div>
  );
}
