"use client";

import DashboardLayout from "@/components/DashboardLayout";
import VaultPayouts from "@/components/dashboard/VaultPayouts";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function VaultPayoutsPage() {
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
        <VaultPayouts />
      </DashboardLayout>
    </>
  );
}
