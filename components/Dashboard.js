"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-lg font-semibold">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;
