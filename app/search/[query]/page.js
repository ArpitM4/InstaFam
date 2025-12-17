import SearchClient from "@/components/SearchClient";
import { searchCreators } from "@/actions/exploreActions";

export const dynamic = 'force-dynamic';

const SearchResults = async ({ params }) => {
  const query = decodeURIComponent(params.query);
  const results = await searchCreators(query);

  return <SearchClient initialResults={results} query={query} />;
};

export default SearchResults;
