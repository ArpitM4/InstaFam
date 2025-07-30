import connectDb from "@/db/ConnectDb";
import User from "@/models/User";

export async function GET(req) {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return Response.json([], { status: 200 });
  }

  // Fetch only verified users
  const users = await User.find({
    username: { $regex: q, $options: "i" },
    "instagram.isVerified": true, // Only verified profiles
  }).select("username _id profilepic");

  return Response.json(users);
}
