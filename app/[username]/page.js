"use client";

import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-6xl font-bold text-pink-500 mb-4">404</h1>
      <p className="text-2xl mb-6 text-gray-300">Oops! Page not found.</p>
      <p className="mb-10 text-gray-400 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved. Please check the URL or return home.
      </p>
      <Link
        href="/"
        className="flex items-center bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition shadow-md"
      >
        <FaArrowLeft className="mr-2" /> Go Back Home
      </Link>
    </div>
  );
}
