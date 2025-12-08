import ExploreClient from "@/components/ExploreClient";
import { getExploreCreators } from "@/actions/exploreActions";

const ExplorePage = async () => {
  // Fetch data on the server
  const creators = await getExploreCreators();

  return <ExploreClient initialCreators={creators} />;
};

export default ExplorePage;
