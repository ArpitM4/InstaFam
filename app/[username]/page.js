// app/[username]/page.js (server component, no "use client")
import PaymentPage from "@/components/PaymentPage";
import { fetchuser } from "@/actions/useractions";
import { notFound, redirect } from "next/navigation";

const UsernamePage = async ({ params }) => {
  const user = await fetchuser(params.username);

  if (!user) {
    notFound(); // 🔥 Redirects to 404
  }
  else if (!user.instagram?.isVerified) {
    redirect('/unverified')
  }

  return <PaymentPage username={params.username} />;
};

export default UsernamePage;
