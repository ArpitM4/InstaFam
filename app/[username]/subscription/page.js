import PaymentPage from "@/components/PaymentPage";
import { fetchuser } from "@/actions/useractions";
import { fetchCreatorVaultItemsServer } from "@/actions/serverVaultActions";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/app/api/auth/[...nextauth]/route";

const SubscriptionPage = async ({ params }) => {
  const user = await fetchuser(params.username);
  const session = await getServerSession(nextAuthConfig);
  const isOwnProfile = session?.user?.email === user?.email;

  if (!user) {
    notFound();
  }

  // Check if subscription section is visible
  const visibleSections = user.visibleSections || ['contribute', 'vault', 'links'];

  if (!visibleSections.includes('subscription')) {
    if (isOwnProfile) {
      redirect(`/${params.username}`);
    }
    notFound();
  }

  // Fetch vault items for the creator
  const vaultResult = await fetchCreatorVaultItemsServer(params.username);
  const vaultItems = vaultResult.success ? vaultResult.items : [];

  return <PaymentPage username={params.username} initialUser={user} initialVaultItems={vaultItems} initialTab="subscription" />;
};

export default SubscriptionPage;
