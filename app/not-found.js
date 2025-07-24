// app/not-found.js
"use client";

import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text text-center px-6">
      <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-text/60 mb-6">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="flex items-center text-text px-4 py-2 bg-primary rounded hover:bg-primary/80 transition"
      >
        <FaArrowLeft className="mr-2" /> Back to Home
      </Link>
    </div>
  );
}
