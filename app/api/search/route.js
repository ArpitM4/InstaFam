import connectDb from "@/db/ConnectDb";
import User from "@/models/User";

export async function GET(req) {
  await connectDb();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return Response.json([], { status: 200 });
  }

  // Fetch username, profilepic, and followers
  const users = await User.find({
    username: { $regex: q, $options: "i" },
  }).select("username _id profilepic followers");

  return Response.json(users);
}
