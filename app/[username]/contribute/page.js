import PaymentPage from "@/components/PaymentPage";
import { fetchuser } from "@/actions/useractions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/app/api/auth/[...nextauth]/route";

const ContributePage = async ({ params }) => {
  const user = await fetchuser(params.username);
  const session = await getServerSession(nextAuthConfig);

  // Check for missing payment info
  const hasPaymentInfo = user?.paymentInfo?.phone || user?.paymentInfo?.upi;
  const isVerified = user?.instagram?.isVerified;
  
  // Check if current session user is the same as the profile being viewed
  const isOwnProfile = session?.user?.email === user?.email;

  if (!user) {
    notFound();
  } else if (!isVerified || !hasPaymentInfo) {
    // If it's the user's own profile, show profile incomplete message
    if (isOwnProfile) {
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
    } else {
      // If it's another user visiting, show coming soon message
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-text">
          <div className="max-w-lg w-full p-8 bg-secondary/10 border border-secondary/20 rounded-xl shadow-md text-center">
            <h1 className="text-3xl font-bold text-primary mb-4">🚀 Coming Soon</h1>
            <p className="text-lg text-text/80 mb-4">
              This creator page is currently being set up and will be available soon.
            </p>
            <p className="text-sm text-text/60 mb-6">
              The creator is working on completing their profile and payment setup.
            </p>
            <a href="/explore" className="inline-block px-6 py-3 bg-primary text-text rounded-md font-semibold hover:bg-primary/80 transition">
              Explore Other Creators
            </a>
          </div>
        </div>
      );
    }
  }

  return <PaymentPage username={params.username} />;
};

export default ContributePage;
