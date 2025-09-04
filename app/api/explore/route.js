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

  return Response.json(creators);
}

