"use client";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text">
      <div className="text-center space-y-4">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
        <p className="text-text">Loading ..</p>
      </div>
    </div>
  );
}