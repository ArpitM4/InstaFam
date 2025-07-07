// app/[username]/page.js (server component, no "use client")
import PaymentPage from "@/components/PaymentPage";
import { fetchuser } from "@/actions/useractions";
import { notFound } from "next/navigation";

const UsernamePage = async ({ params }) => {
  const user = await fetchuser(params.username);

  if (!user || !user.instagram?.isVerified) {
    notFound(); // 🔥 Redirects to 404
  }

  return <PaymentPage username={params.username} />;
};

export default UsernamePage;
