
import PaymentPage from "@/components/PaymentPage";
import { fetchuser } from "@/actions/useractions";
import { fetchCreatorVaultItemsServer } from "@/actions/serverVaultActions";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const user = await fetchuser(params.username);

  if (!user || user.visibility === 'hidden') {
    return {
      title: 'Profile Not Found',
      description: 'The requested profile could not be found.',
    };
  }

  const title = `${user.name || user.username}`;
  const description = user.description || `Check out ${user.username}'s profile on Sygil. Connect, support, and get exclusive content.`;
  const image = user.profilepic || 'https://www.sygil.app/og-image.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${user.username}'s profile picture`,
        },
      ],
      type: 'profile',
      username: user.username,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@sygil_official',
    },
  };
}

const UsernamePage = async ({ params }) => {
  const user = await fetchuser(params.username);
  const session = await getServerSession(nextAuthConfig);

  // Check visibility
  const isHidden = user?.visibility === "hidden";

  // Check if current session user is the same as the profile being viewed
  const isOwnProfile = session?.user?.email === user?.email;

  if (!user) {
    notFound();
  } else if (isHidden && !isOwnProfile) {
    // If it's another user visiting a hidden page, show coming soon message
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a15] text-white">
        <div className="max-w-lg w-full p-8 glass-card rounded-2xl text-center border border-white/10">
          <div className="text-6xl mb-6">🙈</div>
          <h1 className="text-3xl font-bold gradient-text mb-4">Profile Hidden</h1>
          <p className="text-lg text-gray-300 mb-4">
            @{params.username} is currently working on their page.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Check back soon!
          </p>
          <a href="/" className="inline-block px-8 py-3 btn-gradient text-white rounded-xl font-bold hover:scale-105 transition-transform">
            Explore Sygil
          </a>
        </div>
      </div>
    );
  }

  // Fetch vault items for the creator
  const vaultResult = await fetchCreatorVaultItemsServer(params.username);
  const vaultItems = vaultResult.success ? vaultResult.items : [];

  return <PaymentPage username={params.username} initialUser={user} initialVaultItems={vaultItems} initialTab="links" />;
};

export default UsernamePage;
