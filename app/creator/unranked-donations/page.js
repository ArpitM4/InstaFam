"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchuser } from "@/actions/useractions";
import DashboardLayout from "@/components/DashboardLayout";
import UnrankedDonations from "@/components/dashboard/UnrankedDonations";

/**
 * Unranked Donations Dashboard Page
 * Shows all-time list of unranked (non-event) donations for the creator
 */
const UnrankedDonationsPage = () => {
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
      <UnrankedDonations />
    </DashboardLayout>
  );
};

export default UnrankedDonationsPage;

