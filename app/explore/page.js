// app/explore/page.js
import ExploreClient from "@/components/ExploreClient";
import { getExploreCreators } from "@/actions/exploreActions";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

const ExplorePage = async () => {
  const session = await getServerSession(nextAuthConfig);
  // Pass current user email if available
  const creators = await getExploreCreators(session?.user?.email);

  return <ExploreClient initialCreators={creators} />;
};

export default ExplorePage;
