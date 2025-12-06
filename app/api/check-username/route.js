import connectDB from "@/db/ConnectDb";
import User from "@/models/User";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get("username");

        if (!username || username.length < 3) {
            return Response.json({ available: false, error: "Invalid username" }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } });

        return Response.json({ available: !user });
    } catch (error) {
        console.error("Check username error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
