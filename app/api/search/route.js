import connectDb from "@/db/ConnectDb";
import User from "@/models/User";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return Response.json([], { status: 200 });
  }

  // Fetch only verified users using index on username
  const users = await User.find({
    username: { $regex: q, $options: "i" },
    "instagram.isVerified": true, // Only verified profiles
  }).select("username _id profilepic").lean();

  // Add cache headers - cache for 1 minute for search results
  return new Response(JSON.stringify(users), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}

