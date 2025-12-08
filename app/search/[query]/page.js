import SearchClient from "@/components/SearchClient";
import { searchCreators } from "@/actions/exploreActions";

const SearchResults = async ({ params }) => {
  const query = decodeURIComponent(params.query);
  const results = await searchCreators(query);

  return <SearchClient initialResults={results} query={query} />;
};

export default SearchResults;
