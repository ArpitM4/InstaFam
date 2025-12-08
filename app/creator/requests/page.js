"use client";

import DashboardLayout from "@/components/DashboardLayout";
import VaultRequests from "@/components/dashboard/VaultRequests";

export default function RequestsPage() {
  return (
    <DashboardLayout>
      <VaultRequests />
    </DashboardLayout>
  );
}

