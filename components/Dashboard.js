"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchuser } from "@/actions/useractions";
import DashboardLayout from "@/components/DashboardLayout";
import GeneralSettings from "@/components/dashboard/GeneralSettings";

const Dashboard = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (session) {
      loadUser();
    }
  }, [session]);

  const loadUser = async () => {
    try {
      const userData = await fetchuser(session.user.name);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  return (
    <DashboardLayout>
      <GeneralSettings user={user} onUserUpdate={setUser} />
    </DashboardLayout>
  );
};

export default Dashboard;

