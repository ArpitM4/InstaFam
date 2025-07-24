"use client";

import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function unverified() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text text-center px-6">
      <h1 className="text-6xl font-bold mb-4 text-accent">Hold Up!</h1>
      <h2 className="text-2xl font-semibold mb-2">Verification Required</h2>
      <p className="text-text/60 mb-6 max-w-md">
        You need to verify your Instagram account to access this page. Head to your dashboard to complete the verification process.
      </p>
      <Link
        href="/account"
        className="flex items-center text-text px-4 py-2 bg-primary rounded hover:bg-primary/80 transition"
      >
        <FaArrowLeft className="mr-2" /> Go to Account Settings
      </Link>
    </div>
  );
}
