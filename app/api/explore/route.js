import connectDb from "@/db/ConnectDb";
import User from "@/models/User";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  await connectDb();

  // Find 20 random public users
  const creators = await User.aggregate([
    { $match: { visibility: "public" } },
    { $sample: { size: 20 } },
    { $project: { username: 1, _id: 1, profilepic: 1 } }
  ]);

  // Add cache headers - cache for 5 minutes, stale-while-revalidate for 10 minutes
  return new Response(JSON.stringify(creators), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}

