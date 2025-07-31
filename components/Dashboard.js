"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { fetchuser } from "@/actions/useractions";
import DashboardLayout from "@/components/DashboardLayout";
import GeneralSettings from "@/components/dashboard/GeneralSettings";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ top: 72 }}
      />
      <DashboardLayout>
        <GeneralSettings user={user} onUserUpdate={setUser} />
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
