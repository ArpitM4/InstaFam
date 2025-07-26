
import PaymentPage from "@/components/PaymentPage";
import { fetchuser } from "@/actions/useractions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const UsernamePage = async ({ params }) => {
  const user = await fetchuser(params.username);

  // Check for missing payment info
  const hasPaymentInfo = user?.paymentInfo?.phone || user?.paymentInfo?.upi;
  const isVerified = user?.instagram?.isVerified;

  if (!user) {
    notFound();
  } else if (!isVerified || !hasPaymentInfo) {
    // Show custom message for incomplete verification/payment info
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <div className="max-w-lg w-full p-8 bg-secondary/10 border border-secondary/20 rounded-xl shadow-md text-center">
          <h1 className="text-2xl font-bold text-error mb-4">Profile Incomplete</h1>
          <p className="text-lg text-text/80 mb-2">
            {isVerified
              ? "Please complete your payment information in the dashboard to activate your creator page."
              : "Your account is not verified. Please complete Instagram verification and payment information in the dashboard to activate your creator page."}
          </p>
          <a href="/dashboard" className="inline-block mt-4 px-6 py-3 bg-primary text-text rounded-md font-semibold hover:bg-primary/80 transition">Go to Dashboard</a>
        </div>
      </div>
    );
  }

  return <PaymentPage username={params.username} />;
};

export default UsernamePage;
