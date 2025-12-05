import connectDb from "@/db/ConnectDb";
import User from "@/models/User";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  await connectDb();

  // Find 20 random verified creators (accountType: Creator or VCreator)
  const creators = await User.aggregate([
    { $match: { "instagram.isVerified": true, accountType: { $in: ["Creator", "VCreator"] } } },
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

