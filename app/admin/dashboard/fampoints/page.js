import { Suspense } from 'react';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import FamPointsClient from '@/components/admin/FamPointsClient';

export const metadata = {
  title: 'FamPoints Management - Admin Dashboard',
  description: 'Manage and view FamPoints statistics and analytics',
};

export default function FamPointsPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6 px-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">FamPoints Management</h1>
          <p className="text-[var(--text)]/60 mt-1">
            View comprehensive FamPoints statistics, trends, and manage the points system.
          </p>
        </div>
        
        <Suspense fallback={
          <div className="bg-[var(--background)] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        }>
          <FamPointsClient />
        </Suspense>
      </div>
    </AdminDashboardLayout>
  );
}
