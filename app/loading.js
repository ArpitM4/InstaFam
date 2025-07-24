// app/loading.js
"use client";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-lg font-semibold">Loading InstaFam...</p>
      </div>
    </div>
  );
}
