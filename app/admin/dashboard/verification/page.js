import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout';
import OTPVerificationClient from '@/components/admin/OTPVerificationClient';

async function isAdminUser(email) {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email);
}

export default async function OTPVerificationPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || !(await isAdminUser(session.user.email))) {
    redirect('/');
  }

  return (
    <AdminDashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--text)]">OTP Verification</h1>
          <p className="text-[var(--text)] opacity-70 mt-2">Approve creator Instagram verifications</p>
        </div>
        <OTPVerificationClient />
      </div>
    </AdminDashboardLayout>
  );
}
