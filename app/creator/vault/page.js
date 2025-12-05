"use client";

import DashboardLayout from "@/components/DashboardLayout";
import MyVault from "@/components/dashboard/MyVault";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function VaultPage() {
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
        <MyVault />
      </DashboardLayout>
    </>
  );
}
