// app/not-found.js
"use client";

import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center px-6">
      <h1 className="text-6xl font-bold mb-4 text-pink-500">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-gray-400 mb-6">
        Sorry, the page you're looking for doesn’t exist or has been moved.
      </p>
      <Link
        href="/"
        className="flex items-center text-white px-4 py-2 bg-pink-600 rounded hover:bg-pink-700 transition"
      >
        <FaArrowLeft className="mr-2" /> Back to Home
      </Link>
    </div>
  );
}
