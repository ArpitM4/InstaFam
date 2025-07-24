import PaymentPage from "@/components/PaymentPage";
import { fetchuser } from "@/actions/useractions";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // 👈 Update this path based on where you define your authOptions

const UsernamePage = async ({ params }) => {
  const session = await getServerSession(authOptions);

  // if (!session) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-background text-text">
  //       <p className="text-xl text-center">You must be logged in to access this page.</p>
  //     </div>
  //   );
  // }

  const user = await fetchuser(params.username);

  if (!user) {
    notFound(); // 🔥 Redirects to 404
  } else if (!user.instagram?.isVerified) {
    redirect("/unverified");
  }

  return <PaymentPage username={params.username} />;
};

export default UsernamePage;
